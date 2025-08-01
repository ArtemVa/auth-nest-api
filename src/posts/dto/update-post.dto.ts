import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
    @ApiProperty({
        type: String,
        description: 'The update title of the post',
        example: 'My First update Post'
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        type: String,
        description: 'The update description of the post',
        example: 'This is my first update post!'
    })
    @IsOptional()
    @IsString()
    description?: string;
}