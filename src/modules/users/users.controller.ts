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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateAccount(@Param('id') id: string) {
    return this.usersService.deactivateAccount(id);
  }
}
