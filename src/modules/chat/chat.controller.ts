import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Delete, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto, CreateMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Req() req: Request,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const userId = req.user?.['sub'];
    return this.chatService.createConversation(userId, createConversationDto);
  }

  @Get('conversations')
  async getUserConversations(@Req() req: Request) {
    const userId = req.user?.['sub'];
    return this.chatService.getUserConversations(userId);
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @Req() req: Request,
  ) {
    const userId = req.user?.['sub'];
    return this.chatService.getConversationById(conversationId, userId);
  }

  @Post('messages')
  async sendMessage(
    @Req() req: Request,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const userId = req.user?.['sub'];
    return this.chatService.sendMessage(userId, createMessageDto);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id', ParseIntPipe) conversationId: number,
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user?.['sub'];
    return this.chatService.getMessages(
      conversationId,
      userId,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
  }

  @Post('messages/:id/read')
  async markMessageAsRead(
    @Param('id', ParseIntPipe) messageId: number,
    @Req() req: Request,
  ) {
    const userId = req.user?.['sub'];
    await this.chatService.markMessageAsRead(messageId, userId);
    return { success: true };
  }

  @Post('conversations/:id/read-all')
  async markAllMessagesAsRead(
    @Param('id', ParseIntPipe) conversationId: number,
    @Req() req: Request,
  ) {
    const userId = req.user?.['sub'];
    await this.chatService.markAllMessagesAsRead(conversationId, userId);
    return { success: true };
  }

  @Delete('messages/:id')
  async deleteMessage(
    @Param('id', ParseIntPipe) messageId: number,
    @Req() req: Request,
  ) {
    const userId = req.user?.['sub'];
    await this.chatService.deleteMessage(messageId, userId);
    return { success: true };
  }

  @Get('conversations/:id/direct/:userId')
  async getOrCreateDirectConversation(
    @Param('userId') otherUserId: string,
    @Req() req: Request,
  ) {
    const userId = req.user?.['sub'];
    
    // Try to find existing conversation
    let conversation = await this.chatService.findDirectConversation(userId, otherUserId);
    
    // If not found, create new one
    if (!conversation) {
      conversation = await this.chatService.createConversation(userId, {
        participantIds: [otherUserId],
        isGroup: false,
      });
    }
    
    return conversation;
  }
}
