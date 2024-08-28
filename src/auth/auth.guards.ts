import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./auth.decorator";
import { jwtConstants } from "./constant";
import { Request } from "express";
import { Types } from "mongoose";
import { UsersService } from "src/users/users.service";
import * as dto from "./dto/token.dto"
import { UsersType } from 'src/users/role/user.role';
import { PERMISSION_KEY, ROLES_KEY } from "./role.decorator";
import { ConfigService } from "@nestjs/config";
import { ModelService } from "src/model/model.service";
import { Role } from 'src/staff/role/staff.role';

@Injectable()
export class AuthGuard implements CanActivate {
  private user_scope
  private admin_scope
  private staff_scope

  constructor(
    private ConfigService:ConfigService,
    private Model: ModelService,

    private jwtService: JwtService, private reflector: Reflector) {
      
      this.user_scope = this.ConfigService.get<string>('USER_SCOPE')
      this.admin_scope = this.ConfigService.get<string>('ADMIN_SCOPE')
      this.staff_scope = this.ConfigService.get<string>('STAFF_SCOPE')

    }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredRoles = this.reflector.getAllAndOverride<UsersType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
  ]);

  const requiredPermissions = this.reflector.getAllAndOverride<Role[]>(PERMISSION_KEY, [
    context.getHandler(),
    context.getClass(),
]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token)
      console.log('payload',payload);
      
      let { scope } = payload
      console.log("scope", scope)
    console.log("requiredRoles",requiredRoles);
    console.log("requiredRoles.includes(UsersType.user)",requiredRoles.includes(UsersType.user));
    console.log(payload.scope === this.user_scope && requiredRoles.includes(UsersType.user),"payload.scope === this.user_scope && requiredRoles.includes(UsersType.user)");
    
       
      if (scope == this.admin_scope && requiredRoles.includes(UsersType.admin)) {
       console.log('admin scope');
        
        let data: any = await this.verifyToken(payload, token);
        if (data) {
            let { id } = payload;
            let query = { _id: id, user_type: { $in:[ UsersType.admin] } }
            let fetch_admin: any = await this.Model.UserModel.find(query)
             //console.log("-=--=-=-==-fetchadminAdmin Data=-=-=----",fetch_admin)
            if (fetch_admin.length) {
            //     let { roles, super_admin } = fetch_admin[0];
            //     let split_api_path = api_path.split('/');
            //     let new_path = split_api_path[2];
            //     let second_new_path = new_path.split('?')[0]
            //     let type = second_new_path.toUpperCase();
            //     if (super_admin != true && type != "PROFILE" && type != "COMMENT") {
            //         let check_roles = roles.includes(type);
            //         if (check_roles != true) {
            //             throw new UnauthorizedException();
            //         }
            //     }
            // }
            request.admin_data = fetch_admin;
            return request.admin_data;
        }
        else {
            throw new HttpException("admin not found", HttpStatus.UNAUTHORIZED)
        }
      }
     }else if(scope == this.staff_scope && requiredRoles.includes(UsersType.staff)){
      let data: any = await this.verifyToken(payload, token)
      if (data) {
          let { id } = payload;
          let query = { _id: id, user_type: { $in:[ UsersType.staff] } }
          let fetch_admin: any = await this.Model.UserModel.find(query)
          // console.log("-=--=-=-==-fetchadminAdmin Data=-=-=----",fetch_user)
          if (fetch_admin.length) {
          //     let { roles, super_admin } = fetch_admin[0];
          //     let split_api_path = api_path.split('/');
          //     let new_path = split_api_path[2];
          //     let second_new_path = new_path.split('?')[0]
          //     let type = second_new_path.toUpperCase();
          //     if (super_admin != true && type != "PROFILE" && type != "COMMENT") {
          //         let check_roles = roles.includes(type);
          //         if (check_roles != true) {
          //             throw new UnauthorizedException();
          //         }
          //     }
          }
          request.admin_data = fetch_admin;
          return request.admin_data;
      }
      else {
          throw new HttpException("admin not found", HttpStatus.UNAUTHORIZED)
      }
     }else if(payload.scope === this.user_scope && requiredRoles.includes(UsersType.user)){
      console.log("abfiabsfjbasfosbn");
      
      let data: any = await this.verifyToken(payload, token)
      console.log("data",data);
      
      if (data.length) {
        console.log("new payload",);
        
          let { id } = payload;
          let query = { _id: id }
          let fetch_user: any = await this.Model.UserModel.findOne(query)
          request.user_data = fetch_user;
          return request.user_data;
      }
      else {
          throw new HttpException("user not found", HttpStatus.UNAUTHORIZED)
      }
    }
     console.log('payload',payload);

    
    } catch {
      console.log('UnauthorizedException');

      throw new UnauthorizedException();
    }
    console.log("return");
    
    // return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyToken(payload: any, token: any) {
    let { scope } = payload;
    let query: any;
    if (scope == this.admin_scope) {
        let { id: admin_id, token_gen_at } = payload;
        query = {
          user_id: admin_id,
            access_token: { $ne: null },
            user_type:UsersType.admin
            // token_gen_at: token_gen_at
        }
    }
    if (scope == this.staff_scope) {
      let { id: admin_id, token_gen_at } = payload;
      query = {
        user_id: admin_id,
          access_token: { $ne: null },
          user_type:UsersType.staff
          // token_gen_at: token_gen_at
      }
  }
    if (scope == this.user_scope) {
      console.log("payload",payload);
      
        let { id: user_id, token_gen_at} = payload;
        query = {
          user_id: new Types.ObjectId(user_id),
            user_type:UsersType.user,
            // access_token: { $ne: null },
            access_token: token
        }
    }
    let projection = { __v: 0 }
    let option = { lean: true }

    let fetch_data: any = await this.Model.SessionModel.find(query, projection, option)
    if (fetch_data.length) {
        return fetch_data
    }
    else {
        throw new UnauthorizedException("Wrong scope")
    }
}

}






    @Injectable()
    export class SocketGuard implements CanActivate {
        constructor(
            private readonly userservices: UsersService,
            // private readonly model : UsersService,
            private jwtService: JwtService,
        ) { }

        canActivate = async (context: ExecutionContext): Promise<boolean> => {
          console.log("socket running")
            const socket = context.switchToWs().getClient();
            const token = socket.handshake.headers.token;
            if (!token) {
                throw new UnauthorizedException()
            }
            else {
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
                    // let projection = { _v: 0 }
                    // let options = { lean: true }
                    // const payload = await this.jwtservice.verifyAsync(token, { secret: 'admin_super_seckret_key' });
                    // console.log("payload", payload);
                    // let { scope } = payload;
                    // if (scope == "user") {
                    //     let data = await this.verifyToken(payload);
                    //     if (data) {
                    //         let { _id } = payload;
                    //         let query = { _id: _id }
                    //         let fetch_user:any = await this.userservices.getUserData(query)
                    //         if (fetch_user) {
                    //             fetch_user.session_id = data._id
                    //             socket.user_data = fetch_user
                    //             return socket.user_data
                    //         }
                    //     }
                    //     else {
                    //         throw new NotFoundException("user not found")
                    //     }
                    // }
                } catch {
                    throw new UnauthorizedException();
                }
            }

        }
      }





// @Injectable()
// export class SocketGuard implements CanActivate {
//     constructor(
//         private readonly userservices: UsersService,
//         // private readonly model : UsersService,
//         private jwtservice: JwtService,
//     ) { }

//     canActivate = async (context: ExecutionContext): Promise<boolean> => {

//         const socket = context.switchToWs().getClient();
//         // console.log("socket-----",socket.handshake);
//         const token = socket.handshake.headers.token;
//         console.log("token", token);
//         if (!token) {
//             throw new UnauthorizedException()
//         }
//         else {
//             try {
//                 const token = socket.handshake.headers.token.split(' ')[1];
//                 console.log("token1.....", token);

//                 let projection = { _v: 0 }
//                 let options = { lean: true }
//                 const payload = await this.jwtservice.verifyAsync(token, { secret: 'admin_super_seckret_key' });
//                 console.log("payload", payload);
//                 let { scope } = payload;
//                 if (scope == "user") {
//                     let data = await this.verifyToken(payload);
//                     if (data) {
//                         let { _id } = payload;
//                         let query = { _id: _id }
//                         let fetch_user:any = await this.userservices.getUserData(query)
//                         if (fetch_user) {
//                             fetch_user.session_id = data._id
//                             socket.user_data = fetch_user
//                             return socket.user_data
//                         }
//                     }
//                     else {
//                         throw new NotFoundException("user not found")
//                     }
//                 }
//             } catch {
//                 throw new UnauthorizedException();
//             }
//         }

//     }

//     verifyToken = async (payload: dto.itoken) => {
//         try {
//             console.log("paylod---", payload);

//             let { scope } = payload;
//             let query: any;
          
//             if (scope == "user") {
//                 let { _id: user_id } = payload
//                 query = {
//                     user_id: new Types.ObjectId(user_id),
//                     access_token: { $ne: null }
//                 }
//             }
//             let projection = { _v: 0 }
//             let options = { lean: true }
//             console.log("query", query);

//             let fcm_data = await this.userservices.getSessionData(query)
//             console.log("fcm data", fcm_data);

//             if (fcm_data) {
//                 return fcm_data
//             }
//             else {
//                 throw new HttpException("Sessions Not Found", HttpStatus.NOT_FOUND)
//             }
//         }
//         catch (error) {
//             throw error
//         }
//     }


// }

// @Injectable()
// export class SocketDisConnect {
//     constructor(
//         private jwtservice: JwtService,
//         // private model: ModelService
//         private readonly userservices: UsersService,
//     ) { }

//     verify_token = async (token: any) => {

//         if (!token) {
//             throw new UnauthorizedException()
//         }
//         else {
//             try {
//                 const new_token = token.split(' ')[1];
//                 console.log("new_token.....", new_token);
//                 let projection = { _v: 0 }
//                 let options = { lean: true }
//                 const payload = await this.jwtservice.verifyAsync(new_token, { secret: 'admin_super_seckret_key' });
//                 console.log("payload", payload);
//                 let { scope } = payload;
//                 if (scope == "user") {
//                     let data = await this.verifyToken(payload);
//                     if (data) {
//                         let { _id } = payload;
//                         let query = { _id: _id }
//                         let fetch_user:any = await this.userservices.getUserData(query)
//                         if (fetch_user) {
//                             fetch_user.session_id = data._id
//                             return fetch_user
//                         }
//                     }
//                     else {

//                         throw new NotFoundException('user not found')
//                     }
//                 }
//             } catch (e) {
//                 console.log("error", e);
//                 throw new UnauthorizedException()
//             }
//         }

//     }

//     verifyToken = async (payload: dto.itoken) => {
//         try {
//             console.log("paylod---", payload);

//             let { scope } = payload;
//             let query: any;
//             if (scope == "admin") {
//                 let { _id: admin_id } = payload
//                 query = {
//                     admin_id: new Types.ObjectId(admin_id),
//                     access_token: { $ne: null }
//                 }
//             }
//             if (scope == "user") {
//                 let { _id: user_id } = payload
//                 query = {
//                     user_id: new Types.ObjectId(user_id),
//                     access_token: { $ne: null }
//                 }
//             }
//             let projection = { _v: 0 }
//             let options = { lean: true }
//             console.log("query", query);
//             let fcm_data = await this.userservices.getSessionData(query)
//             console.log("fcm data", fcm_data);

//             if (fcm_data) {
//                 return fcm_data
//             }
//             else {
//                 throw new HttpException("Sessions Not Found", HttpStatus.NOT_FOUND)
//             }
//         }
//         catch (error) {
//             throw error
//         }
//     }


// }