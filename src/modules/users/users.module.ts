import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { UsersService } from './users.service';
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
