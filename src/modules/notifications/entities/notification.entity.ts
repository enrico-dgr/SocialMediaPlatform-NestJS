import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User, Post } from 'src/database/entities';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'recipient_id' })
  recipientId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ name: 'actor_id' })
  actorId: number;

  @ManyToOne(() => Post, { eager: true, nullable: true })
  @JoinColumn({ name: 'post_id' })
  post?: Post;

  @Column({ name: 'post_id', nullable: true })
  postId?: number;

  @CreateDateColumn()
  createdAt: Date;
}
