import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
    
    @ApiProperty({
        type: String,
        description: 'The title of the post',
        example: 'My First Post'
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        type: String,
        description: 'The description of the post',
        example: 'This is my first post!'
    })
    @IsNotEmpty()
    @IsString()
    description: string;
}