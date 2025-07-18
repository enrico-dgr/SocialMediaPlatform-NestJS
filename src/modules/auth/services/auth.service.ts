import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { LoginDto, RegisterUserDto } from '../../users/dtos';
import { User } from 'src/database/entities';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.usersService.register(registerDto);

    // Remove password from user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.generateToken(user),
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Remove password from user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.generateToken(user),
      user: userWithoutPassword,
    };
  }

  async validateToken(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }
}
