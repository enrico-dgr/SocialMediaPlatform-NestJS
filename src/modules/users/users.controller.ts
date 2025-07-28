import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requests';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Body() updateDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    return this.usersService.updateProfile(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id') id: string,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/account')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateAccount(@Param('id') id: string) {
    return this.usersService.deactivateAccount(id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Follow another user to see their posts in your feed.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to follow',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User followed successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Already following this user' })
  @ApiBadRequestResponse({ description: 'Cannot follow yourself' })
  async followUser(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.usersService.followUser(req.user.id, id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Unfollow a user to stop seeing their posts in your feed.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to unfollow',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token missing or invalid' })
  @ApiNotFoundResponse({
    description: 'User not found or not following this user',
  })
  @ApiBadRequestResponse({ description: 'Cannot unfollow yourself' })
  async unfollowUser(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.usersService.unfollowUser(req.user.id, id);
  }

  @Get(':id/followers')
  @ApiOperation({
    summary: 'Get user followers',
    description: 'Retrieves the list of users following the specified user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          bio: { type: 'string' },
          avatarUrl: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  @ApiOperation({
    summary: 'Get users being followed',
    description:
      'Retrieves the list of users that the specified user is following.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Following list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          bio: { type: 'string' },
          avatarUrl: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get user statistics',
    description:
      'Retrieves user statistics including followers, following, and posts count.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        followersCount: { type: 'number', example: 150 },
        followingCount: { type: 'number', example: 75 },
        postsCount: { type: 'number', example: 42 },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  @Get(':followerId/is-following/:followingId')
  @ApiOperation({
    summary: 'Check if user is following another user',
    description: 'Checks if one user is following another user.',
  })
  @ApiParam({
    name: 'followerId',
    description: 'ID of the potential follower',
    example: 'uuid-string',
  })
  @ApiParam({
    name: 'followingId',
    description: 'ID of the user being potentially followed',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow status checked successfully',
    schema: { type: 'boolean', example: true },
  })
  async isFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.usersService.isFollowing(followerId, followingId);
  }
}
