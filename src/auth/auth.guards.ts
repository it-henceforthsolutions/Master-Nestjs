import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./auth.decorator";
import { jwtConstants } from "./constant";
import { Request } from "express";
import { Types } from "mongoose";
import { UsersService } from "src/users/users.service";
import * as dto from "./dto/token.dto"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
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