import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashUtil } from './utils/hash.util';
import { AuthUtil } from './utils/auth.util';
import { LoginRequest } from './dto/login.dto';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;
  let hashUtil: HashUtil;
  let jwtUtil: AuthUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashUtil,
          useValue: {
            compare: jest.fn(),
            hash: jest.fn(),
          },
        },
        {
          provide: AuthUtil,
          useValue: {
            auth: jest.fn(),
            setCookie: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    hashUtil = module.get<HashUtil>(HashUtil);
    jwtUtil = module.get<AuthUtil>(AuthUtil);
  });

  describe('login', () => {
    const dto: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
    };

    const mockRes = {} as any;

    it('should throw if user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockRes, dto)).rejects.toThrow(
        new NotFoundException('User with this email does not exist'),
      );
    });

    it('should throw if password is incorrect', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (hashUtil.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockRes, dto)).rejects.toThrow(
        new NotFoundException('User with this email does not exist'),
      );
    });

    it('should return token if credentials are valid', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (hashUtil.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtil.auth as jest.Mock).mockResolvedValue({ accessToken: 'token' });

      const result = await service.login(mockRes, dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
        select: { id: true, email: true, password: true },
      });
      expect(hashUtil.compare).toHaveBeenCalledWith(dto.password, mockUser.password);
      expect(jwtUtil.auth).toHaveBeenCalledWith(mockRes, mockUser.id);
      expect(result).toEqual({ accessToken: 'token' });
    });
  });
});
