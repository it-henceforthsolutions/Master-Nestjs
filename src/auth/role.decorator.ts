import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/staff/role/staff.role';
import { UsersType } from 'src/users/role/user.role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UsersType[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSION_KEY = 'permissions';
export const Permission = (...permissions: Role[]) => SetMetadata(PERMISSION_KEY, permissions);