import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto';

interface UserSocket extends Socket {
  userId?: string;
}

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: UserSocket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user connection
      this.connectedUsers.set(userId, client.id);
      client.userId = userId;

      console.log(`User ${userId} connected to chat`);

      // Join user to their personal room for direct messages
      await client.join(`user_${userId}`);

      // Join user to all their conversation rooms
      const conversations = await this.chatService.getUserConversations(userId);
      for (const conversation of conversations) {
        await client.join(`conversation_${conversation.id}`);
      }

      // Emit online status
      client.broadcast.emit('userOnline', { userId });
    } catch (error) {
      console.error('Chat WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: UserSocket) {
    const userId = client.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected from chat`);
      
      // Emit offline status
      client.broadcast.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.userId;
    if (!userId) return;

    try {
      // Verify user is participant in conversation
      await this.chatService.getConversationById(data.conversationId, userId);
      
      // Join conversation room
      await client.join(`conversation_${data.conversationId}`);
      
      // Notify others in the conversation that user has joined
      client.to(`conversation_${data.conversationId}`).emit('userJoinedConversation', {
        conversationId: data.conversationId,
        userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Leave conversation room
    await client.leave(`conversation_${data.conversationId}`);
    
    // Notify others in the conversation that user has left
    client.to(`conversation_${data.conversationId}`).emit('userLeftConversation', {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const userId = client.userId;
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(userId, createMessageDto);
      
      // Emit message to all participants in the conversation
      this.server.to(`conversation_${message.conversationId}`).emit('newMessage', message);
      
      // Send confirmation to sender
      client.emit('messageSent', { messageId: message.id });
    } catch (error) {
      client.emit('messageError', { error: error.message });
    }
  }

  @SubscribeMessage('markMessageRead')
  async handleMarkMessageRead(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { messageId: number },
  ) {
    const userId = client.userId;
    if (!userId) return;

    try {
      await this.chatService.markMessageAsRead(data.messageId, userId);
      
      // Notify others in the conversation about read status
      // We'll need to get the conversation ID from the ChatService
      // For now, emit the messageRead event without conversation targeting
      client.broadcast.emit('messageRead', {
        messageId: data.messageId,
        userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('markAllRead')
  async handleMarkAllRead(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.userId;
    if (!userId) return;

    try {
      await this.chatService.markAllMessagesAsRead(data.conversationId, userId);
      
      // Notify others in the conversation
      client.to(`conversation_${data.conversationId}`).emit('allMessagesRead', {
        conversationId: data.conversationId,
        userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: number, isTyping: boolean },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Broadcast typing status to other participants
    client.to(`conversation_${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
      isTyping: data.isTyping,
    });
  }

  // Helper method to get message with conversation info
  private async getMessageWithConversation(messageId: number) {
    // This would require injecting the message repository or creating a method in ChatService
    // For now, returning null - can be implemented if needed
    return null;
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Method to send message to specific user
  async sendMessageToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Method to send message to conversation
  async sendMessageToConversation(conversationId: number, event: string, data: any) {
    this.server.to(`conversation_${conversationId}`).emit(event, data);
  }
}
