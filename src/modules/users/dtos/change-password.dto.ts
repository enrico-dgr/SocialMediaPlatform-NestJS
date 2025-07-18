import { IsString, MinLength, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePasswordDto {
  @Field()
  @IsString()
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  newPassword: string;
}
