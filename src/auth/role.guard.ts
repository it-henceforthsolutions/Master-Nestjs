import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersType } from 'src/users/role/user.role';
import { ROLES_KEY } from './role.decorator';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private userService: UsersService) { }

    async canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<UsersType[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true
        }
        let user = context.switchToHttp().getRequest();
        user = await this.userService.findUser(user.user.id)
        if(user.user_type == 'staff'){
            
        }
        let hasrequiredRoles = requiredRoles.some((role) => user.user_type?.includes(role));
        if (!hasrequiredRoles) {
            throw new HttpException('You have no permission to access this resource', HttpStatus.FORBIDDEN)
        }
        return hasrequiredRoles

    }
}