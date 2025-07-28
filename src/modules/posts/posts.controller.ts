import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { RequestWithUser } from 'src/types/requests';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new post',
    description:
      'Creates a new post with text content and optional media attachments.',
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Post creation data',
    examples: {
      textPost: {
        summary: 'Simple text post',
        value: {
          content: 'Just had the most amazing coffee this morning! ☕️',
        },
      },
      mediaPost: {
        summary: 'Post with image',
        value: {
          content: 'Check out this beautiful sunset!',
          imageUrl: 'https://example.com/sunset.jpg',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        content: {
          type: 'string',
          example: 'Just had the most amazing coffee!',
        },
        imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiBadRequestResponse({ description: 'Invalid post data' })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
    description:
      'Retrieves all active posts ordered by creation date (newest first).',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter posts by specific user',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          imageUrl: { type: 'string' },
          likesCount: { type: 'number' },
          commentsCount: { type: 'number' },
          isLikedByCurrentUser: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getAllPosts(
    @Query('userId') userId?: string,
    @Request() req?: RequestWithUser,
  ) {
    if (userId) {
      return this.postsService.getPostsByUser(userId, req?.user?.id);
    }
    return this.postsService.getAllPosts(req?.user?.id);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get personalized feed',
    description:
      'Retrieves posts from users that the current user follows, plus their own posts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed posts retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  async getFeedPosts(@Request() req: RequestWithUser) {
    return this.postsService.getFeedPosts(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieves a specific post by its ID with all comments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async getPostById(@Param('id') id: string, @Request() req?: RequestWithUser) {
    return this.postsService.getPostById(id, req?.user?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update post',
    description: 'Updates a post. Only the author can update their own posts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiForbiddenResponse({ description: 'Can only update your own posts' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postsService.updatePost(id, req.user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete post',
    description: 'Deletes a post. Only the author can delete their own posts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiForbiddenResponse({ description: 'Can only delete your own posts' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async deletePost(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Like a post',
    description: 'Adds a like to the specified post.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Post liked successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiConflictResponse({ description: 'Post already liked' })
  async likePost(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.postsService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unlike a post',
    description: 'Removes a like from the specified post.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Post unliked successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiNotFoundResponse({ description: 'Post or like not found' })
  async unlikePost(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.postsService.unlikePost(id, req.user.id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add comment to post',
    description: 'Adds a new comment to the specified post.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiBody({
    type: CreateCommentDto,
    examples: {
      comment: {
        summary: 'Example comment',
        value: {
          content: 'Great post! Thanks for sharing.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Comment added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async addComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postsService.addComment(postId, req.user.id, createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: 'Get post comments',
    description: 'Retrieves all comments for the specified post.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getComments(@Param('id') postId: string) {
    return this.postsService.getCommentsByPost(postId);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete comment',
    description:
      'Deletes a comment. Authors can delete their own comments, post authors can delete any comment on their posts.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiForbiddenResponse({
    description: 'Can only delete your own comments or comments on your posts',
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.postsService.deleteComment(commentId, req.user.id);
  }
}
