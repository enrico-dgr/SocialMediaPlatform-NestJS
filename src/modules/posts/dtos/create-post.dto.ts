import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreatePostDto {
  @Field()
  @ApiProperty({
    description: 'The textual content of the post',
    example: 'Just had the most amazing coffee this morning! ☕️',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'URL of an image to attach to the post',
    example: 'https://example.com/my-photo.jpg',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'URL of a video to attach to the post',
    example: 'https://example.com/my-video.mp4',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  videoUrl?: string;
}
