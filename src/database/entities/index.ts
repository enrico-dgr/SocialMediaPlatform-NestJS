import { User } from './user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

export { User, Post, Comment, Like };

/**
 * Array of all entities for TypeORM configuration
 * This is used in the TypeORM configuration to
 * automatically register all entities
 */
export const entities = [User, Post, Comment, Like];
