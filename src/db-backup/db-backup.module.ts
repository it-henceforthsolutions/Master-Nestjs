import { Module } from '@nestjs/common';
import { DbBackupService } from './db-backup.service';
import { DbBackupController } from './db-backup.controller';
import { SharpService } from 'nestjs-sharp';
import { AwsConfig } from './config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[UsersModule],
  controllers: [DbBackupController],
  providers: [DbBackupService,AwsConfig,SharpService]
})
export class DbBackupModule {}
