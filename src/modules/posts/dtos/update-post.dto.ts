import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class UpdatePostDto {
  @Field({ nullable: true })
  @ApiProperty({
    description: 'The updated textual content of the post',
    example:
      'Updated: Just had the most amazing coffee this morning! ☕️ #blessed',
    required: false,
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'URL of an image to attach to the post',
    example: 'https://example.com/updated-photo.jpg',
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
    example: 'https://example.com/updated-video.mp4',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  videoUrl?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'Whether the post is active and visible',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
