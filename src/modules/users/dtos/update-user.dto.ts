import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'User biography',
    example: 'Updated bio about myself',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatar.jpg',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
