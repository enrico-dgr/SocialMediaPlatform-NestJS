import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { User } from '../../../database/entities';
import { RegisterUserDto, LoginDto } from '../../users/dtos';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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
        AuthService,
        {
          provide: UsersService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',

      bio: 'Test bio',
    };

    it('should register a new user and return login response', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      usersService.register.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: userWithoutPassword,
      });
      expect(usersService.register).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user and return access token', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      usersService.validateUser.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: userWithoutPassword,
      });
      expect(usersService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      usersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.validateUser.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should return user if token is valid', async () => {
      const payload = { sub: '1', email: 'test@example.com', username: 'testuser' };
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateToken(payload);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if user not found', async () => {
      const payload = { sub: '1', email: 'test@example.com', username: 'testuser' };
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateToken(payload);

      expect(result).toBeNull();
    });
  });
});
