import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User, Post } from 'src/database/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createLikeNotification(
    actorId: number,
    recipientId: number,
    postId: number,
    actorUsername: string,
  ): Promise<Notification | null> {
    // Don't create notification if user likes their own post
    if (actorId === recipientId) {
      return null;
    }

    const notification = this.notificationRepository.create({
      type: NotificationType.LIKE,
      message: `${actorUsername} liked your post`,
      actorId,
      recipientId,
      postId,
    });

    return this.notificationRepository.save(notification);
  }

  async createCommentNotification(
    actorId: number,
    recipientId: number,
    postId: number,
    actorUsername: string,
  ): Promise<Notification | null> {
    // Don't create notification if user comments on their own post
    if (actorId === recipientId) {
      return null;
    }

    const notification = this.notificationRepository.create({
      type: NotificationType.COMMENT,
      message: `${actorUsername} commented on your post`,
      actorId,
      recipientId,
      postId,
    });

    return this.notificationRepository.save(notification);
  }

  async createFollowNotification(
    actorId: number,
    recipientId: number,
    actorUsername: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: NotificationType.FOLLOW,
      message: `${actorUsername} started following you`,
      actorId,
      recipientId,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: number, limit = 20): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, recipientId: userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async getNotificationsSince(userId: number, since: Date): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { 
        recipientId: userId,
        createdAt: MoreThanOrEqual(since)
      },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }
}
