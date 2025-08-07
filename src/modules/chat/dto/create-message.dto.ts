import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsNumber()
  conversationId: number;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
