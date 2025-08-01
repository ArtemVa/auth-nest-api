import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { isDev } from '../../utils/is-dev.util';

@Injectable()
export class AuthUtil {

    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: number;
    private readonly JWT_REFRESH_TOKEN_TTL: number;
    private readonly COOKIE_DOMAIN: string;
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<number>('JWT_ACCESS_TOKEN_TTL');
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<number>('JWT_REFRESH_TOKEN_TTL');
        this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    }

    auth(res: Response, id: number) {
        const {accessToken, refreshToken} = this.generateTokens(id);
        const expiresInMs = this.JWT_REFRESH_TOKEN_TTL;
        this.setCookie(res, refreshToken, new Date(Date.now() + 1000 * 60 * 60 *24 * 7));
    
        return {accessToken};
    }

    generateTokens(id: number) {
        const payload: JwtPayload = { id };
        const accessToken = this.jwtService.sign(payload, { 
            secret: this.JWT_SECRET,
            expiresIn: this.JWT_ACCESS_TOKEN_TTL 
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.JWT_SECRET,
            expiresIn: this.JWT_REFRESH_TOKEN_TTL
        });

        return {
            accessToken,
            refreshToken,
        }
    }

    async refreshTokens(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        try {
            const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);
            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    setCookie(res: Response, value: string, expires: Date) {
        res.cookie('refreshToken', value, { 
            expires, 
            httpOnly: true, 
            domain: this.COOKIE_DOMAIN,
            secure: !isDev(this.configService),
            sameSite: isDev(this.configService) ? 'none' : 'lax',
        });
    }
}