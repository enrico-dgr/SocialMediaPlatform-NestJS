/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post, Comment, Like } from '../../database/entities';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dtos';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: jest.Mocked<Repository<Post>>;
  let commentRepository: jest.Mocked<Repository<Comment>>;
  let likeRepository: jest.Mocked<Repository<Like>>;

  const mockPost = {
    id: '1',
    content: 'Test post content',
    imageUrl: undefined,
    videoUrl: undefined,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user1',
    comments: [],
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    isLikedByCurrentUser: false,
  } as unknown as Post;

  const mockComment = {
    id: '1',
    content: 'Test comment',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user1',
    postId: '1',
  } as unknown as Comment;

  const mockLike = {
    id: '1',
    createdAt: new Date(),
    userId: 'user1',
    postId: '1',
  } as unknown as Like;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Like),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get(getRepositoryToken(Post));
    commentRepository = module.get(getRepositoryToken(Comment));
    likeRepository = module.get(getRepositoryToken(Like));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    const createPostDto: CreatePostDto = {
      content: 'Test post content',
      imageUrl: 'https://example.com/image.jpg',
    };

    it('should create a post successfully', async () => {
      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);

      const result = await service.createPost('user1', createPostDto);

      expect(result).toEqual(mockPost);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...createPostDto,
        authorId: 'user1',
      });
      expect(postRepository.save).toHaveBeenCalledWith(mockPost);
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.getPostById('1', 'user1');

      expect(result).toEqual(mockPost);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
        relations: ['author', 'comments', 'likes', 'comments.author'],
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(service.getPostById('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    const updatePostDto: UpdatePostDto = {
      content: 'Updated content',
    };

    it('should update a post successfully', async () => {
      const updatedPost = { ...mockPost, ...updatePostDto };
      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.save.mockResolvedValue(updatedPost);
      // Mock the getPostById call
      jest.spyOn(service, 'getPostById').mockResolvedValue(updatedPost);

      const result = await service.updatePost('1', 'user1', updatePostDto);

      expect(result).toEqual(updatedPost);
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePost('1', 'user1', updatePostDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const otherUserPost = { ...mockPost, authorId: 'user2' };
      postRepository.findOne.mockResolvedValue(otherUserPost);

      await expect(
        service.updatePost('1', 'user1', updatePostDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likePost', () => {
    it('should like a post successfully', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      likeRepository.findOne.mockResolvedValue(null);
      likeRepository.create.mockReturnValue(mockLike);
      likeRepository.save.mockResolvedValue(mockLike);

      const result = await service.likePost('1', 'user1');

      expect(result).toBe(true);
      expect(likeRepository.save).toHaveBeenCalledWith(mockLike);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(service.likePost('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if post already liked', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      likeRepository.findOne.mockResolvedValue(mockLike);

      await expect(service.likePost('1', 'user1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('addComment', () => {
    const createCommentDto: CreateCommentDto = {
      content: 'Test comment',
    };

    it('should add a comment successfully', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockResolvedValue(mockComment);

      const result = await service.addComment('1', 'user1', createCommentDto);

      expect(result).toEqual(mockComment);
      expect(commentRepository.create).toHaveBeenCalledWith({
        ...createCommentDto,
        postId: '1',
        authorId: 'user1',
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addComment('1', 'user1', createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
