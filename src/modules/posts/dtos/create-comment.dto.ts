import { IsString, MaxLength, MinLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateCommentDto {
  @Field()
  @ApiProperty({
    description: 'The textual content of the comment',
    example: 'Great post! Thanks for sharing.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
