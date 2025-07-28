import { IsString, MinLength, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class ChangePasswordDto {
  @Field()
  @ApiProperty({
    description: 'Current user password',
    example: 'OldPassword123'
  })
  @IsString()
  currentPassword: string;

  @Field()
  @ApiProperty({
    description: 'New password for the user',
    example: 'NewSecurePassword456',
    minLength: 8,
    maxLength: 255
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  newPassword: string;
}
