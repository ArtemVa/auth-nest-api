import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterRequest } from './dto/register.dto';
import { UserEntity } from '../users/entities/user.entity';
import { HashUtil } from './utils/hash.util';
import { AuthUtil } from './utils/auth.util';
import { LoginRequest } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtPayload } from './utils/interfaces/jwt.interface';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository(UserEntity) 
        private readonly userRepository: Repository<UserEntity>,
        private readonly hashUtil: HashUtil,
        private readonly jwtUtil: AuthUtil,
    ) {}

    async register(res: Response, dto: RegisterRequest) {
        const {name, email, password} = dto;
        const existUser = await this.userRepository.findOne({where: {email}});
        if(existUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashUtil.hash(password);
        const user = this.userRepository.create({
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1] || '',
            email,
            password: hashedPassword
        });

        await this.userRepository.save(user);
        return this.jwtUtil.auth(res, user.id);
    }

    async login(res: Response, dto: LoginRequest) {
        const {email, password} = dto;
        const user = await this.userRepository.findOne({
            where: {email}, 
            select: {id: true, email: true, password: true}
        });

        if(!user) {
            throw new NotFoundException('User with this email does not exist');
        }

        const isPasswordMatch = await this.hashUtil.compare(password, user.password);
        if(!isPasswordMatch) {
            throw new NotFoundException('User with this email does not exist');
        }

        return this.jwtUtil.auth(res, user.id);
    }

    async logout(res: Response) {
        this.jwtUtil.setCookie(res, 'refreshToken', new Date(0));
        return true;
    }

    async refresh(req: Request, res: Response) {
        const payload: JwtPayload = await this.jwtUtil.refreshTokens(req, res);
        const user = await this.userRepository.findOne({
            where: {id: payload.id},
            select: {id: true}
        });
        if(!user) {
            throw new NotFoundException('User not found');
        }

        return this.jwtUtil.auth(res, user.id);
    }

    async validate(id: number) {
        const user = await this.userRepository.findOne({
            where: {id}
        });

        if(!user) {
            throw new NotFoundException('Invalid user');
        }

        return user;
    }
}
