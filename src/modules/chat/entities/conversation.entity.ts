import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';
import { User } from 'src/database/entities';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string; // For group chats

  @Column({ default: false })
  isGroup: boolean;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Message, message => message.conversation, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field for last message (populated by service)
  lastMessage?: Message | null;

  // Virtual field for unread count per user (populated by service)
  unreadCount?: number;
}
