import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, Comment, Like } from 'src/database/entities';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dtos';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createPost(
    authorId: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      authorId,
    });

    await this.postsRepository.save(post);

    return this.getPostById(post.id, authorId);
  }

  async getAllPosts(currentUserId?: string): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      where: { isActive: true },
      relations: ['author', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
    });

    // Add computed fields
    return posts.map((post) => this.addComputedFields(post, currentUserId));
  }

  async getPostById(id: string, currentUserId?: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, isActive: true },
      relations: ['author', 'comments', 'likes', 'comments.author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.addComputedFields(post, currentUserId);
  }

  async getPostsByUser(
    userId: string,
    currentUserId?: string,
  ): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      where: { authorId: userId, isActive: true },
      relations: ['author', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => this.addComputedFields(post, currentUserId));
  }

  async updatePost(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    await this.postsRepository.save(post);

    return this.getPostById(id, userId);
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete by setting isActive to false
    await this.postsRepository.update(id, { isActive: false });
    return true;
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    // Check if post exists
    const post = await this.postsRepository.findOne({
      where: { id: postId, isActive: true },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.likesRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      throw new ConflictException('Post already liked');
    }

    // Create like
    const like = this.likesRepository.create({
      postId,
      userId,
    });

    await this.likesRepository.save(like);

    // Send real-time notification for like
    if (post.authorId !== userId) {
      try {
        const actor = await this.usersService.findById(userId);
        if (!actor) return true; // If actor not found, just continue
        const notification =
          await this.notificationsService.createLikeNotification(
            parseInt(userId),
            parseInt(post.authorId),
            parseInt(postId),
            actor.username,
          );

        if (notification) {
          await this.notificationsGateway.sendNotificationToUser(
            parseInt(post.authorId),
            notification,
          );
        }
      } catch (error) {
        console.error('Failed to send like notification:', error);
        // Don't throw error - notification failure shouldn't break like functionality
      }
    }

    return true;
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    // Check if post exists
    const post = await this.postsRepository.findOne({
      where: { id: postId, isActive: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Find and remove like
    const result = await this.likesRepository.delete({
      postId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Like not found');
    }

    return true;
  }

  async addComment(
    postId: string,
    authorId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // Check if post exists
    const post = await this.postsRepository.findOne({
      where: { id: postId, isActive: true },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId,
      authorId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Send real-time notification for comment
    if (post.authorId !== authorId) {
      try {
        const actor = await this.usersService.findById(authorId);
        if (!actor) return savedComment; // If actor not found, just continue
        const notification =
          await this.notificationsService.createCommentNotification(
            parseInt(authorId),
            parseInt(post.authorId),
            parseInt(postId),
            actor.username,
          );

        if (notification) {
          await this.notificationsGateway.sendNotificationToUser(
            parseInt(post.authorId),
            notification,
          );
        }
      } catch (error) {
        console.error('Failed to send comment notification:', error);
        // Don't throw error - notification failure shouldn't break comment functionality
      }
    }

    return savedComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId, isActive: true },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['post'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // User can delete their own comment OR the post author can delete any comment on their post
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on your posts',
      );
    }

    // Soft delete by setting isActive to false
    await this.commentsRepository.update(commentId, { isActive: false });
    return true;
  }

  // Helper method to add computed fields
  private addComputedFields(post: Post, currentUserId?: string): Post {
    post.likesCount = post.likes?.length || 0;
    post.commentsCount = post.comments?.filter((c) => c.isActive).length || 0;

    if (currentUserId && post.likes) {
      post.isLikedByCurrentUser = post.likes.some(
        (like) => like.userId === currentUserId,
      );
    }

    return post;
  }

  // Get posts for feed (from followed users)
  async getFeedPosts(userId: string): Promise<Post[]> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoin('author.followers', 'followers')
      .where('post.isActive = :isActive', { isActive: true })
      .andWhere('(followers.id = :userId OR post.authorId = :userId)', {
        userId,
      })
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    return posts.map((post) => this.addComputedFields(post, userId));
  }
}
