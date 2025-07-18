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
}
