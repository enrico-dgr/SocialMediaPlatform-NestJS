import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/entities';
import { RegisterUserDto, UpdateUserDto, ChangePasswordDto } from './dtos';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    bio: 'Test bio',
    avatarUrl: undefined,
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
    comments: [],
    following: [],
    followers: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return null if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test bio',
    };

    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test bio',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    });

    it('should return null if credentials are invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'User',
      bio: 'Updated bio',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateProfile('1', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    };

    it('should change password successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      userRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      const result = await service.changePassword('1', changePasswordDto);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'hashedpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(userRepository.update).toHaveBeenCalledWith('1', { password: 'newhashed' });
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword('1', changePasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('followUser', () => {
    const followingUser = { ...mockUser, id: '2', username: 'following_user' };

    it('should follow a user successfully', async () => {
      const followerWithFollowing = { ...mockUser, following: [] };
      
      userRepository.findOneBy.mockImplementation((criteria: any) => {
        if (criteria.id === '1') return Promise.resolve(mockUser);
        if (criteria.id === '2') return Promise.resolve(followingUser);
        return Promise.resolve(null);
      });
      
      userRepository.findOne.mockResolvedValue(followerWithFollowing);
      userRepository.save.mockResolvedValue(followerWithFollowing);

      const result = await service.followUser('1', '2');

      expect(result).toBe(true);
      expect(followerWithFollowing.following).toContain(followingUser);
      expect(userRepository.save).toHaveBeenCalledWith(followerWithFollowing);
    });

    it('should throw BadRequestException when trying to follow yourself', async () => {
      await expect(service.followUser('1', '1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user to follow does not exist', async () => {
      userRepository.findOneBy.mockImplementation((criteria: any) => {
        if (criteria.id === '1') return Promise.resolve(mockUser);
        if (criteria.id === '2') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await expect(service.followUser('1', '2')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already following', async () => {
      const followerWithFollowing = { ...mockUser, following: [followingUser] };
      
      userRepository.findOneBy.mockImplementation((criteria: any) => {
        if (criteria.id === '1') return Promise.resolve(mockUser);
        if (criteria.id === '2') return Promise.resolve(followingUser);
        return Promise.resolve(null);
      });
      
      userRepository.findOne.mockResolvedValue(followerWithFollowing);

      await expect(service.followUser('1', '2')).rejects.toThrow(ConflictException);
    });
  });

  describe('unfollowUser', () => {
    const followingUser = { ...mockUser, id: '2', username: 'following_user' };

    it('should unfollow a user successfully', async () => {
      const followerWithFollowing = { ...mockUser, following: [followingUser] };
      
      userRepository.findOne.mockResolvedValue(followerWithFollowing);
      userRepository.save.mockResolvedValue(followerWithFollowing);

      const result = await service.unfollowUser('1', '2');

      expect(result).toBe(true);
      expect(followerWithFollowing.following).not.toContain(followingUser);
      expect(userRepository.save).toHaveBeenCalledWith(followerWithFollowing);
    });

    it('should throw BadRequestException when trying to unfollow yourself', async () => {
      await expect(service.unfollowUser('1', '1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if not following the user', async () => {
      const followerWithFollowing = { ...mockUser, following: [] };
      userRepository.findOne.mockResolvedValue(followerWithFollowing);

      await expect(service.unfollowUser('1', '2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isFollowing', () => {
    const followingUser = { ...mockUser, id: '2', username: 'following_user' };

    it('should return true if following', async () => {
      const followerWithFollowing = { ...mockUser, following: [followingUser] };
      userRepository.findOne.mockResolvedValue(followerWithFollowing);

      const result = await service.isFollowing('1', '2');

      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      const followerWithFollowing = { ...mockUser, following: [] };
      userRepository.findOne.mockResolvedValue(followerWithFollowing);

      const result = await service.isFollowing('1', '2');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.isFollowing('1', '2');

      expect(result).toBe(false);
    });
  });
});
