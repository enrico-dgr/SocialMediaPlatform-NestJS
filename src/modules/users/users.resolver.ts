import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/database/entities';
import { UpdateUserDto, ChangePasswordDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('input') updateDto: UpdateUserDto,
    @Context() context,
  ): Promise<User> {
    return this.usersService.updateProfile(context.req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async changePassword(
    @Args('input') changePasswordDto: ChangePasswordDto,
    @Context() context,
  ): Promise<boolean> {
    return this.usersService.changePassword(
      context.req.user.id,
      changePasswordDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async deactivateAccount(@Context() context): Promise<boolean> {
    return this.usersService.deactivateAccount(context.req.user.id);
  }
}
