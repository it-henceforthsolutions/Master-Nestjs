import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus,Request, Response  } from '@nestjs/common';


@Catch()
export class ErrorHandler implements ExceptionFilter {
      catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        console.log("response---",response);
        
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message:any = 'Internal Server Error';
        if(!Array.isArray(message)){
          message = [message]
        }
        // const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        // const message = exception.message || 'Internal Server Error';
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.getResponse()['message'] || exception.message;
            console.log("exception error", message);
            if(!Array.isArray(message)){
              message = [message]
            }
          }
          console.log("message----",message);
          
        response.status(status).json({
          statusCode: status,
          message: message[0],
        });
      }
}

