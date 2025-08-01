import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Request, Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { Authorization } from './decorators/authorization.decorator';
import { Authorized } from './decorators/authorized.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { MeResponse } from './dto/me.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user with provided data',
    tags: ['Auth'],
    responses: {
      '201': {description: 'User has been registered successfully'},
      '400': {description: 'Invalid email or password'},
      '409': {description: 'User with this email already exists'}
    }
  })

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Res({passthrough: true}) res: Response, @Body() registerRequest: RegisterRequest) {
    return this.authService.register(res, registerRequest);
  }

  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticates a user with provided credentials',
    tags: ['Auth'],
    responses: {
      '200': {description: 'User has been authenticated successfully'},
      '401': {description: 'Invalid input data'},
      '404': {description: 'User with this email does not exist'}
    }
  })

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Res({passthrough: true}) res: Response, @Body() loginRequest: LoginRequest) {
    return this.authService.login(res, loginRequest);
  }

  @ApiOperation({
    summary: 'Logout a user',
    description: 'Logs out a user from the current session',
    tags: ['Auth'],
    responses: {
      '200': {description: 'User has been logged out successfully'}
    }
  })
  @Authorization()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({passthrough: true}) res: Response) {
    return this.authService.logout(res);
  }

  @ApiOperation({
    summary: 'Refresh a user token',
    description: 'Refreshs a user token after it has expired',
    tags: ['Auth'],
    responses: {
      '200': {description: 'User token has been refreshed successfully'},
      '401': {description: 'Invalid refresh token'}
    }
  })
  @Authorization()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Authorized() user: UserEntity): Promise<MeResponse> {
    const { id, email, lastName, firstName } = user;
    return { id, lastName, firstName, email };
  }
}
