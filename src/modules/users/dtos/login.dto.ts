import { IsString, IsEmail } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class LoginDto {
  @Field()
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @Field()
  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123'
  })
  @IsString()
  password: string;
}
