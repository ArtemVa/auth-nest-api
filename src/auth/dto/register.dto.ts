import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterRequest {
    @ApiProperty({
        type: String,
        description: "User's full name",
        maxLength: 50,
        example: "John Doe"
    })
    @IsString({message: "Name must be a string"})
    @IsNotEmpty({message: "Name is required"})
    @MaxLength(50, {message: "Name must be less than or equal to 50 characters"})
    name: string;
    
    @ApiProperty({
        type: String,
        description: "User's email address",
        example: "john.doe@example.com"
    })
    @IsString({message: "Email must be a string"})
    @IsNotEmpty({message: "Email is required"})
    @IsEmail({}, {message: "Invalid email format"})
    email: string;

    @ApiProperty({
        type: String,
        description: "User's password",
        minLength: 8,
        maxLength: 100,
        example: "Password123"
    })
    @IsString({message: "Password must be a string"})
    @IsNotEmpty({message: "Password is required"})
    @MinLength(8, {message: "Password must be at least 8 characters long"})
    @MaxLength(100, {message: "Password must be less than or equal to 100 characters"})
    password: string;
}