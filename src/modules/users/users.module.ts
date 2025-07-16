import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { UsersService } from './users.service';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
