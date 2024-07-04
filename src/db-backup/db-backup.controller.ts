import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DbBackupService } from './db-backup.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { RolesGuard } from 'src/auth/role.guard';
import { AuthGuard } from 'src/auth/auth.guards';
import { UsersType } from 'src/users/role/user.role';
import { Permission, Roles } from 'src/auth/role.decorator';
import { Role } from 'src/staff/role/staff.role';

@ApiTags('db-backup')
@Controller('db-backup')
export class DbBackupController {
    constructor(private readonly dbBackupService: DbBackupService) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.manage)
    @ApiOperation({summary: 'database backup'})
    @ApiResponse({ status: 201, description: 'OK' })
    @Post()
    async backupAndUpload() {
        const s3Url = await this.dbBackupService.backup_case_1();
        return { s3Url };
    }
}
