import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DbBackupService } from './db-backup.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/role.guard';
import { AuthGuard } from 'src/auth/auth.guards';
import { UsersType } from 'src/users/role/user.role';
import { Roles } from 'src/auth/role.decorator';

@ApiTags('db-backup')
@Controller('db-backup')
export class DbBackupController {
    constructor(private readonly dbBackupService: DbBackupService) { }
    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @Post()
    async backupAndUpload() {
        const s3Url = await this.dbBackupService.backup_case_1();
        return { s3Url };
    }
}
