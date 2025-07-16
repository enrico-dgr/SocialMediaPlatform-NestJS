import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Post } from './post.entity';

@ObjectType({ description: 'Comment model' })
@Entity('comments')
export class Comment {
  @Field(() => ID, { description: 'Unique identifier for the comment' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'The textual content of the comment' })
  @Column({ type: 'text' })
  content: string;

  @Field({ description: 'Whether the comment is active and visible' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ description: 'The date and time the comment was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field({ description: 'The date and time the comment was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Foreign keys. Not exposed to GraphQL.
   * Use the relation fields (`author`, `post`) instead.
   */
  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'post_id' })
  postId: string;

  // Relationships

  /**
   * Many-to-One: Many comments belong to one user
   * onDelete: 'CASCADE' means if user is deleted, their comments are deleted
   */
  @Field(() => User, { description: 'The user who wrote the comment' })
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  /**
   * Many-to-One: Many comments belong to one post
   * onDelete: 'CASCADE' means if post is deleted, its comments are deleted
   */
  @Field(() => Post, { description: 'The post this comment belongs to' })
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
