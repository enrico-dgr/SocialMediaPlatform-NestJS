import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { User } from 'src/database/entities';
import { CreateConversationDto, CreateMessageDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { participantIds, name, isGroup } = createConversationDto;

    // Validate participants exist
    const participants = await this.userRepository.find({
      where: { id: In([userId, ...participantIds]) },
    });

    if (participants.length !== participantIds.length + 1) {
      throw new BadRequestException('One or more participants not found');
    }

    // For direct messages (not group), check if conversation already exists
    if (!isGroup && participantIds.length === 1) {
      const existingConversation = await this.findDirectConversation(userId, participantIds[0]);
      if (existingConversation) {
        return existingConversation;
      }
    }

    const conversation = this.conversationRepository.create({
      name: isGroup ? name : undefined,
      isGroup: isGroup || false,
    });

    conversation.participants = participants;

    return this.conversationRepository.save(conversation);
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .where('conversation.isGroup = :isGroup', { isGroup: false })
      .andWhere('participant.id IN (:...userIds)', { userIds: [userId1, userId2] })
      .groupBy('conversation.id')
      .having('COUNT(participant.id) = 2')
      .getOne();

    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('participant.id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Add last message and unread count for each conversation
    return Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await this.getLastMessage(conversation.id);
        const unreadCount = await this.getUnreadCount(conversation.id, userId);
        
        return {
          ...conversation,
          lastMessage,
          unreadCount,
        };
      })
    );
  }

  async getConversationById(conversationId: number, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    return conversation;
  }

  async sendMessage(userId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const { conversationId, content, type = MessageType.TEXT } = createMessageDto;

    // Verify user is participant in conversation
    await this.getConversationById(conversationId, userId);

    const message = this.messageRepository.create({
      content,
      type,
      senderId: userId,
      conversationId,
      readBy: [userId], // Sender has read the message
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's updatedAt timestamp
    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    // Return message with sender information
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    return messageWithSender!;
  }

  async getMessages(conversationId: number, userId: string, limit = 50, offset = 0): Promise<Message[]> {
    // Verify user is participant in conversation
    await this.getConversationById(conversationId, userId);

    const messages = await this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Add isRead property for current user
    return messages.map(message => ({
      ...message,
      isRead: message.readBy?.includes(userId) || false,
    })).reverse(); // Reverse to get chronological order
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation', 'conversation.participants'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is participant
    const isParticipant = message.conversation.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    // Add user to readBy array if not already present
    if (!message.readBy?.includes(userId)) {
      const readBy = message.readBy || [];
      readBy.push(userId);
      await this.messageRepository.update(messageId, { readBy });
    }
  }

  async markAllMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    // Verify user is participant in conversation
    await this.getConversationById(conversationId, userId);

    // Get all unread messages in conversation
    const unreadMessages = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('NOT (message.readBy @> ARRAY[:userId])', { userId })
      .getMany();

    // Mark all as read
    for (const message of unreadMessages) {
      const readBy = message.readBy || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        await this.messageRepository.update(message.id, { readBy });
      }
    }
  }

  private async getLastMessage(conversationId: number): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  private async getUnreadCount(conversationId: number, userId: string): Promise<number> {
    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.senderId != :userId', { userId }) // Don't count own messages
      .andWhere('NOT (message.readBy @> ARRAY[:userId])', { userId })
      .getCount();
  }

  async deleteMessage(messageId: number, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
  }
}
