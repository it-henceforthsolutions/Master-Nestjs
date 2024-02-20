import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  subject: string;

  @ApiProperty()
  text: String;

  @ApiProperty()
  type: 1 | 2; // 1 for all_user & 2 for selected_user

  @ApiProperty()
  notification_type: 1 | 2; // 1 for push & 2 for email

  @ApiProperty()
  @IsOptional()
  emails: string[];
}
