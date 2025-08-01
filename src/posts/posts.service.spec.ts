import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../users/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { PostQueryDto } from './dto/post-query.dto';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<PostEntity>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<PostEntity>>(getRepositoryToken(PostEntity));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const dto: PostQueryDto = {
      page: 1,
      limit: 10,
      title: 'Test Title',
      description: 'Test Desc',
      order: 'DESC',
      orderBy: 'id',
    };

    const mockPosts = [
      { id: 1, title: 'Test Title', description: 'Test Desc' },
      { id: 2, title: 'Test Title', description: 'Test Desc' },
    ];

    const mockResponse = {
      data: mockPosts,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };

    it('should return cached data if available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.findAll(dto);
      expect(cacheManager.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(postRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should query database and cache result if no cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      (postRepository.findAndCount as jest.Mock).mockResolvedValue([mockPosts, 2]);

      const result = await service.findAll(dto);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(postRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          title: 'Test Title',
          description: 'Test Desc',
        },
        take: 10,
        skip: 0,
        order: {
          id: 'DESC',
        },
      });

      expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAllByUser', () => {
  const userId = 1;

  const mockPosts = [
    { id: 1, title: 'First', description: 'One', author: { id: userId } },
    { id: 2, title: 'Second', description: 'Two', author: { id: userId } },
  ];

  const cacheKey = `userPosts:${userId}`;

  it('should return cached posts if available', async () => {
    (cacheManager.get as jest.Mock).mockResolvedValue(mockPosts);

    const result = await service.findAllByUser(userId);

    expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
    expect(postRepository.find).not.toHaveBeenCalled();
    expect(result).toEqual(mockPosts);
  });

  it('should fetch posts from DB and cache them if not cached', async () => {
    (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
    (postRepository.find as jest.Mock).mockResolvedValue(mockPosts);

    const result = await service.findAllByUser(userId);

    expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
    expect(postRepository.find).toHaveBeenCalledWith({
      where: { author: { id: userId } },
    });
    expect(cacheManager.set).toHaveBeenCalledWith(
      cacheKey,
      JSON.stringify(mockPosts),
      60 * 1000
    );
    expect(result).toEqual(mockPosts);
  });
});

  describe('createPost', () => {
    it('should create and save a post', async () => {
      const dto: CreatePostDto = { title: 'Test', description: 'Desc' };
      const user: UserEntity = { id: 1 } as UserEntity;

      const createdPost = { ...dto, author: user };
      (postRepository.create as jest.Mock).mockReturnValue(createdPost);

      await service.createPost(user, dto);

      expect(postRepository.create).toHaveBeenCalledWith({ ...dto, author: user });
      expect(postRepository.save).toHaveBeenCalledWith(createdPost);
    });
  });
});
