import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';
import { RegisterUserDto, UpdateUserDto, ChangePasswordDto } from './dtos';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  public findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  public async register(registerDto: RegisterUserDto): Promise<User> {
    const { username, email, password, firstName, lastName, bio } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }

      if (existingUser.username === username) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      bio,
    });

    return this.usersRepository.save(user);
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'username',
        'password',
        'firstName',
        'lastName',
        'isActive',
      ],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  public async updateProfile(
    userId: string,
    updateDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateDto, { id: userId });
    return this.usersRepository.save(user);
  }

  public async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // Update password
    await this.usersRepository.update(userId, { password: hashedPassword });
    return true;
  }

  public async deactivateAccount(userId: string): Promise<boolean> {
    const result = await this.usersRepository.update(userId, {
      isActive: false,
    });
    return (result.affected ?? 0) > 0;
  }

  public async activateAccount(userId: string): Promise<boolean> {
    const result = await this.usersRepository.update(userId, {
      isActive: true,
    });
    return (result.affected ?? 0) > 0;
  }

  public async verifyEmail(userId: string): Promise<boolean> {
    const result = await this.usersRepository.update(userId, {
      emailVerified: true,
    });
    return (result.affected ?? 0) > 0;
  }

  public async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true },
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'bio',
        'avatarUrl',
        'createdAt',
      ],
    });
  }

  public async followUser(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    // Prevent self-following
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      this.findById(followerId),
      this.findById(followingId),
    ]);

    if (!follower || !following) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const followerWithFollowing = await this.usersRepository.findOne({
      where: { id: followerId },
      relations: ['following'],
    });

    if (!followerWithFollowing) {
      throw new NotFoundException('Follower not found');
    }

    const isAlreadyFollowing = followerWithFollowing.following.some(
      (user) => user.id === followingId,
    );

    if (isAlreadyFollowing) {
      throw new ConflictException('Already following this user');
    }

    // Add the relationship
    followerWithFollowing.following.push(following);
    await this.usersRepository.save(followerWithFollowing);

    return true;
  }

  public async unfollowUser(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    // Prevent self-unfollowing
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    // Get follower with following relationships
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
      relations: ['following'],
    });

    if (!follower) {
      throw new NotFoundException('User not found');
    }

    // Check if currently following
    const followingIndex = follower.following.findIndex(
      (user) => user.id === followingId,
    );

    if (followingIndex === -1) {
      throw new NotFoundException('Not following this user');
    }

    // Remove the relationship
    follower.following.splice(followingIndex, 1);
    await this.usersRepository.save(follower);

    return true;
  }

  public async getFollowers(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['followers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.followers.filter((follower) => follower.isActive);
  }

  public async getFollowing(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.following.filter((following) => following.isActive);
  }

  public async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
      relations: ['following'],
    });

    if (!follower) {
      return false;
    }

    return follower.following.some((user) => user.id === followingId);
  }

  public async getUserStats(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['followers', 'following', 'posts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      followersCount: user.followers.filter((f) => f.isActive).length,
      followingCount: user.following.filter((f) => f.isActive).length,
      postsCount: user.posts.filter((p) => p.isActive).length,
    };
  }
}
