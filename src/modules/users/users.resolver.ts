import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/database/entities';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  user(@Args('id') id: string) {
    return this.usersService.findById(id);
  }
}
