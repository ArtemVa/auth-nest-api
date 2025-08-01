import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { findAllPostsRespone } from './interfaces/post-response.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostEntity) 
        private readonly postRepository: Repository<PostEntity>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async findAll(dto: PostQueryDto): Promise<findAllPostsRespone> {
        const cacheKey = `posts:${JSON.stringify(dto)}`;
        const cached = await this.cacheManager.get<findAllPostsRespone>(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }

        const {
            page = 1,
            limit = 10,
            title,
            description,
            order = 'Desc',
            orderBy = 'id',
        } = dto;

        const where: any = {};
        if (title) where.title = title;
        if (description) where.description = description;

        const [data, total] = await this.postRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit,
            order: {
            [orderBy]: order.toUpperCase(),
            }
        });

        const result: findAllPostsRespone = {
            data,
            meta: {
                total,
                page: dto.page || 1,
                limit: dto.limit || 10,
                pages: Math.ceil(total / (dto.limit || 10)),
            }
        }

        await this.cacheManager.set(cacheKey, result);
        return result;
    }

    async createPost(author: UserEntity, dto: CreatePostDto): Promise<void> {
        const post = this.postRepository.create({...dto, author});
        await this.postRepository.save(post);
    }

    async findAllByUser(userId: number) {
    const cacheKey = `userPosts:${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
        return cached;
    }
    const posts: PostEntity[] = await this.postRepository.find({
        where: { author: { id: userId } },
    });

    try {
        await this.cacheManager.set(cacheKey, JSON.stringify(posts), 60 * 1000);
    } catch (error) {
        console.error(`Failed to cache posts for key: ${cacheKey}`, error);
    }

    return posts;
}

    async updatePost(postId: number, dto: UpdatePostDto): Promise<void> {
        const post = await this.postRepository.findOne({where: {id: postId}});
        if(!post) {
            throw new NotFoundException('Post not found');
        }

        Object.assign(post, dto);
        await this.postRepository.save(post);
    }

    async deletePost(postId: number): Promise<void> {
        const result = await this.postRepository.delete({ id: postId });
        if (result.affected === 0) {
            throw new NotFoundException('Post not found');
        }
    }
} 
