import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The long-lived refresh token provided upon login/registration' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
