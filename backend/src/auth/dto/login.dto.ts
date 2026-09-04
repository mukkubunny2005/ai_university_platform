import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@aiuniversity.edu', description: 'User institutional email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123456', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
