import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService, LoginResponse } from '../services/auth.service';
import { LoginDto, RegisterUserDto } from '../../users/dtos';
import { User } from 'src/database/entities';
import { JwtAuthGuard } from '../guards';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class AuthPayload {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') registerDto: RegisterUserDto,
  ): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@Context() context: { req: { user: User } }): User {
    return context.req.user;
  }
}
