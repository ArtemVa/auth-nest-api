import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PostQueryDto {
  @ApiProperty({
    type: String,
    description: 'Page number for pagination. Default is 1.',
    default: '1'
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiProperty({
    type: String,
    description: 'Limit number of posts per page. Default is 10.',
    default: '10'
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @ApiProperty({
    type: String,
    description: 'Filter posts by title'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: String,
    description: 'Filter posts by description'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: String,
    description: 'Sort options: ASC or DESC. Default is DESC',
    default: 'DESC'
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    type: String,
    description: 'Sort by field. Default is id'
  })
  @IsOptional()
  @IsIn(['title', 'publishedAt', 'updatedAt'])
  orderBy?: string = 'id';
}