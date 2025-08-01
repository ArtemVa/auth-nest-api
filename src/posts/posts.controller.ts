import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreatePostResponse, DeletePostResponse, UpdatePostResponse, findAllPostsRespone } from './interfaces/post-response.interface';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation } from '@nestjs/swagger';
import { PostQueryDto } from './dto/post-query.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Get all posts',
    description: 'Get all posts from the database',
    tags: ['Posts'],
    responses: {
      '200': {
        description: 'All posts retrieved successfully'
      },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() dto: PostQueryDto
  ): Promise<findAllPostsRespone> {
    return this.postsService.findAll(dto);
  }

  @ApiOperation({
    summary: 'Get all posts by user',
    description: 'Get all posts by a specific user from the database',
    tags: ['Posts'],
    responses: {
      '200': {
        description: 'All posts by user retrieved successfully'
      },
    },
  })
  @Authorization()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findAllUserPosts(@Param('id', ParseIntPipe) id: number) {
    const userPosts = await this.postsService.findAllByUser(id);
    return userPosts;
  }

  @ApiOperation({
    summary: 'Create a post',
    description: 'Create a new post in the database',
    tags: ['Posts'],
    responses: {
      '201': {
        description: 'Post created successfully'
      },
    },
  })
  @Authorization()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Authorized() user: UserEntity, @Body() postDto: CreatePostDto): Promise<CreatePostResponse> {
    await this.postsService.createPost(user, postDto);
    return {message: 'Post created successfully' };
  }

  @ApiOperation({
    summary: 'Update a post',
    description: 'Update an existing post in the database',
    tags: ['Posts'],
    responses: {
      '200': {
        description: 'Post updated successfully'
      },
    },
  })
  @Authorization()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePost(@Param('id', ParseIntPipe) id: number, @Body() postDto: UpdatePostDto): Promise<UpdatePostResponse> {
    await this.postsService.updatePost(id, postDto);
    return { message: 'Post updated successfully' };
  }

  @ApiOperation({
    summary: 'Delete a post',
    description: 'Delete an existing post from the database',
    tags: ['Posts'],
    responses: {
      '200': {
        description: 'Post deleted successfully'
      },
    },
  })
  @Authorization()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<DeletePostResponse> {
    await this.postsService.deletePost(id);
    return { message: 'Post deleted successfully' };
  }
}
