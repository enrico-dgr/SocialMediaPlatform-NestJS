import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@ObjectType({ description: 'Post model' })
@Entity('posts')
export class Post {
  @Field(() => ID, { description: 'Unique identifier for the post' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'The textual content of the post' })
  @Column({ type: 'text' })
  content: string;

  @Field({
    nullable: true,
    description: 'URL of an image attached to the post',
  })
  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl?: string;

  @Field({ nullable: true, description: 'URL of a video attached to the post' })
  @Column({ name: 'video_url', length: 255, nullable: true })
  videoUrl?: string;

  @Field({ description: 'Whether the post is active and visible' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ description: 'The date and time the post was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field({ description: 'The date and time the post was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Foreign key for the author. Not exposed to GraphQL.
   * Use the `author` relation field instead.
   */
  @Column({ name: 'author_id' })
  authorId: string;

  // Relationships

  /**
   * Many-to-One: Many posts belong to one user
   * The @JoinColumn() decorator specifies which column contains the foreign key
   */
  @Field(() => User, { description: 'The user who created the post' })
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  /**
   * One-to-Many: One post can have many comments
   */
  @Field(() => [Comment], {
    nullable: true,
    description: 'Comments on the post',
  })
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  /**
   * One-to-Many: One post can have many likes
   */
  @Field(() => [Like], { nullable: true, description: 'Likes on the post' })
  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  /**
   * Virtual properties - calculated when needed
   * These won't be stored in the database but will be populated
   * when we query for posts
   */
  @Field(() => Int, {
    nullable: true,
    description: 'The number of likes on the post',
  })
  likesCount?: number;
  @Field(() => Int, {
    nullable: true,
    description: 'The number of comments on the post',
  })
  commentsCount?: number;
  @Field(() => Boolean, {
    nullable: true,
    description: 'Whether the post is liked by the current user',
  })
  isLikedByCurrentUser?: boolean;
}
