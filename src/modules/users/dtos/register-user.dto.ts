import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class RegisterUserDto {
  @Field()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @Field()
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email',
    maxLength: 100,
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Field()
  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    maxLength: 50,
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
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'User biography',
    example: 'Software developer from New York',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
