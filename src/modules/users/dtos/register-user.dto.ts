import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterUserDto {
  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @Field()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
