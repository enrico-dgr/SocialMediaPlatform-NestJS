import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Like model, representing a user liking a post' })
@Entity('likes')
@Unique(['userId', 'postId']) // Prevents a user from liking the same post twice
export class Like {
  @Field(() => ID, { description: 'Unique identifier for the like' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'The date and time the like was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Foreign keys. Not exposed to GraphQL.
   * Use the relation fields (`user`, `post`) instead.
   */
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'post_id' })
  postId: string;

  // Relationships

  /**
   * Many-to-One: Many likes belong to one user
   */
  @Field(() => User, { description: 'The user who liked the post' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Many-to-One: Many likes belong to one post
   */
  @Field(() => Post, { description: 'The post that was liked' })
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
