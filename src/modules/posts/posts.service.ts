import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, Comment, Like } from 'src/database/entities';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dtos';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
  ) {}

  async createPost(
    authorId: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      authorId,
    });

    return this.postsRepository.save(post);
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
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId,
      authorId,
    });

    return this.commentsRepository.save(comment);
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
