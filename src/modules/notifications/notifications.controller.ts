import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: Request, @Query('limit') limit?: number) {
    const userId = req.user?.['sub'];
    return this.notificationsService.getUserNotifications(userId, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const userId = req.user?.['sub'];
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') notificationId: number, @Req() req: Request) {
    const userId = req.user?.['sub'];
    await this.notificationsService.markAsRead(notificationId, userId);
    return { success: true };
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = req.user?.['sub'];
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}
