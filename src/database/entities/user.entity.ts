import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'User model' })
@Entity('users')
export class User {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: "User's unique username" })
  @Column({ unique: true, length: 50 })
  username: string;

  @Field({ description: "User's unique email address" })
  @Column({ unique: true, length: 100 })
  email: string;

  /**
   * The user's password hash. This is not exposed to GraphQL.
   */
  @Column({ length: 255 })
  password: string;

  @Field({ nullable: true, description: "User's first name" })
  @Column({ name: 'first_name', length: 50, nullable: true })
  firstName?: string;

  @Field({ nullable: true, description: "User's last name" })
  @Column({ name: 'last_name', length: 50, nullable: true })
  lastName?: string;

  @Field({ nullable: true, description: 'A short biography of the user' })
  @Column({ length: 500, nullable: true })
  bio?: string;

  @Field({ nullable: true, description: 'URL of the user avatar image' })
  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string;

  @Field({ description: 'Whether the user account is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ description: 'Whether the user has verified their email address' })
  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Field({ description: 'The date and time the user was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field({ description: 'The date and time the user was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships

  /**
   * One-to-Many: A user can have many posts
   * The first parameter is the target entity
   * The second parameter is the inverse side property
   */
  @Field(() => [Post], {
    nullable: true,
    description: 'Posts created by the user',
  })
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  /**
   * One-to-Many: A user can have many comments
   */
  @Field(() => [Comment], {
    nullable: true,
    description: 'Comments made by the user',
  })
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  /**
   * Many-to-Many: Users can follow other users
   * This creates a self-referencing relationship
   * @JoinTable() should only be on one side of the relationship
   */
  @Field(() => [User], {
    nullable: true,
    description: 'Other users that this user follows',
  })
  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_follows', // join-table name
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following: User[];

  /**
   * The inverse side of the following relationship
   * This doesn't need @JoinTable() since it's defined on the other side
   */
  @Field(() => [User], {
    nullable: true,
    description: 'Users who follow this user',
  })
  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  /**
   * Virtual property - not stored in database
   * We'll calculate this when needed
   */
  @Field(() => Int, {
    nullable: true,
    description: 'The number of followers this user has',
  })
  followersCount?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'The number of users this user is following',
  })
  followingCount?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'The number of posts this user has created',
  })
  postsCount?: number;
}
