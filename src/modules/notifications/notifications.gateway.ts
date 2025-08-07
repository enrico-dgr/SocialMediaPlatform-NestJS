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
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.decode(token);
      const userId = payload.sub;

      // Store user connection
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user to their personal room
      await client.join(`user_${userId}`);

      console.log(`User ${userId} connected via WebSocket`);

      // Send unread notification count and recent notifications
      const [unreadCount, recentNotifications] = await Promise.all([
        this.notificationsService.getUnreadCount(userId),
        this.notificationsService.getUserNotifications(userId, 10),
      ]);

      client.emit('unreadCount', unreadCount);
      client.emit('notifications', recentNotifications);

      // Send any notifications that were created while user was offline
      await this.sendOfflineNotifications(userId, client);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected from WebSocket`);
    }
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { limit?: number },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      data.limit || 20,
    );

    client.emit('notifications', notifications);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: number },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.notificationsService.markAsRead(data.notificationId, userId);

    // Send updated unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    client.emit('unreadCount', unreadCount);
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.notificationsService.markAllAsRead(userId);

    // Send updated unread count
    client.emit('unreadCount', 0);
  }

  // Method to send real-time notifications
  async sendNotificationToUser(userId: number, notification: Notification) {
    // Send to user's room
    this.server.to(`user_${userId}`).emit('newNotification', notification);

    // Update unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user_${userId}`).emit('unreadCount', unreadCount);
  }

  // Send notifications that were created while user was offline
  private async sendOfflineNotifications(userId: number, client: Socket) {
    try {
      // Get notifications from the last 24 hours that are unread
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const offlineNotifications =
        await this.notificationsService.getNotificationsSince(
          userId,
          twentyFourHoursAgo,
        );

      // Send recent unread notifications one by one to trigger UI animations
      for (const notification of offlineNotifications.slice(0, 5)) {
        if (!notification.isRead) {
          client.emit('newNotification', notification);
          // Small delay to allow UI to process each notification
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Failed to send offline notifications:', error);
    }
  }

  // Helper method to check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}
