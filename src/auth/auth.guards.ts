import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './auth.decorator';
import { jwtConstants } from './constant';
import { Request } from 'express';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import * as dto from './dto/token.dto';
import { UsersType } from 'src/users/role/user.role';
import { PERMISSION_KEY, ROLES_KEY } from './role.decorator';
import { ConfigService } from '@nestjs/config';
import { ModelService } from 'src/model/model.service';
import { Role } from 'src/staff/role/staff.role';
import { token_payload } from './interface/interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private user_scope;
  private admin_scope;
  private staff_scope;

  constructor(
    private ConfigService: ConfigService,
    private Model: ModelService,

    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    this.user_scope = this.ConfigService.get<string>('USER_SCOPE');
    this.admin_scope = this.ConfigService.get<string>('ADMIN_SCOPE');
    this.staff_scope = this.ConfigService.get<string>('STAFF_SCOPE');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredRoles = this.reflector.getAllAndOverride<UsersType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      let session_data: any = await this.verifyToken(payload);
      if (session_data) {
        let query = { _id: session_data.user_id, user_type: session_data.user_type };
        let fetch_user: any = await this.Model.UserModel.findOne(query,{__v:0},{lean:true});
        console.log("fetch_user", fetch_user.role)
        if (fetch_user) {
          if (requiredRoles && !requiredRoles.includes(fetch_user.user_type)) {
            console.log("no permisssion")
            throw new HttpException('You have no permission to access this resource', HttpStatus.FORBIDDEN)
          }
          else if (requiredRoles && payload.scope == this.staff_scope ) {
            const api_path = request.originalUrl;
            let split_api_path = api_path.split('/');
            let { role } = fetch_user
            let new_path = split_api_path[1].toUpperCase()
            if (new_path == "ADMIN") {
              new_path = split_api_path[2].toUpperCase()
            }
            let second_new_path = new_path.split('?')[0]
            console.log("api_path======>", second_new_path)
            console.log("user_roles===>",role)
            let check_roles = role.includes(second_new_path);
            if (check_roles != true) {
                throw new HttpException('You have no permission to access this resource', HttpStatus.FORBIDDEN)
            }
            request.user_data = fetch_user;
            return request.user_data;
          }
          else {
            if (payload.scope == this.admin_scope) {
              request.user_data = fetch_user;
              return request.user_data;
            }
            else if (payload.scope == this.staff_scope ) {
              request.user_data = fetch_user;
              return request.user_data;
            }
            else if ( payload.scope === this.user_scope) {
              request.user_data = fetch_user;
              return request.user_data;
            }
          }
        }
        throw new UnauthorizedException()
      }
    } catch(error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyToken(payload: token_payload) {
    let { scope } = payload;
    let { id: user_id, token_gen_at } = payload;
    let query: any = {
      user_id: new Types.ObjectId(user_id),
      created_at: token_gen_at,
    };
    if (scope == this.admin_scope) query.user_type = UsersType.admin;
    if (scope == this.staff_scope) query.user_type = UsersType.staff;
    if (scope == this.user_scope) query.user_type = UsersType.user;

    let projection = { __v: 0 };
    let option = { lean: true };
    let fetch_data: any = await this.Model.SessionModel.findOne(
      query,
      projection,
      option,
    );
    if (fetch_data) return fetch_data;
    else throw new UnauthorizedException('Wrong scope');
  }
}

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(
    private readonly userservices: UsersService,
    // private readonly model : UsersService,
    private jwtService: JwtService,
  ) {}

  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    console.log('socket running');
    const socket = context.switchToWs().getClient();
    const token = socket.handshake.headers.token;
    if (!token) {
      throw new UnauthorizedException();
    } else {
      try {
        const token = socket.handshake.headers.token.split(' ')[1];
        if (!token) {
          throw new UnauthorizedException();
        }
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: jwtConstants.secret,
          });
          socket['user'] = payload;
        } catch {
          throw new UnauthorizedException();
        }
        return true;
      
      } catch {
        throw new UnauthorizedException();
      }
    }
  };
}

