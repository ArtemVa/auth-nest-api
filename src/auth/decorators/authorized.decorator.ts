import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';

export const Authorized = createParamDecorator(
    (data: keyof UserEntity, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest() as Request;
        const user = request.user as UserEntity;

        return data ? user![data] : user;
    })
