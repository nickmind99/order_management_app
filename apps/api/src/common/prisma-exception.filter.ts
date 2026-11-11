import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@freitty/db';
import type { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const [statusCode, message] = this.map(error, request.method);
    http.getResponse<Response>().status(statusCode).json({ statusCode, message, code: error.code });
  }

  private map(error: Prisma.PrismaClientKnownRequestError, method: string): [number, string] {
    if (error.code === 'P2025') return [HttpStatus.NOT_FOUND, 'Record not found'];
    if (error.code === 'P2002') return [HttpStatus.CONFLICT, 'Record already exists'];
    if (error.code === 'P2003') {
      return method === 'DELETE'
        ? [HttpStatus.CONFLICT, 'Record is still in use']
        : [HttpStatus.BAD_REQUEST, 'Referenced record does not exist'];
    }
    return [HttpStatus.INTERNAL_SERVER_ERROR, 'Database error'];
  }
}
