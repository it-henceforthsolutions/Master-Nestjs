import { SetMetadata } from '@nestjs/common';
import { UsersType } from 'src/users/role/user.role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UsersType[]) => SetMetadata(ROLES_KEY, roles);