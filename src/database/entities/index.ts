import { User } from './user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Notification } from '../../modules/notifications/entities/notification.entity';
import { Conversation } from '../../modules/chat/entities/conversation.entity';
import { Message } from '../../modules/chat/entities/message.entity';

export { User, Post, Comment, Like, Notification, Conversation, Message };

/**
 * Array of all entities for TypeORM configuration
 * This is used in the TypeORM configuration to
 * automatically register all entities
 */
export const entities = [User, Post, Comment, Like, Notification, Conversation, Message];
