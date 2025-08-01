import { ApiProperty } from '@nestjs/swagger';

export class MeResponse {
    @ApiProperty({
        type: String,
        description: "User's id",
        example: 1
    })
    id: number;

    @ApiProperty({
        type: String,
        description: "User's last name",
        example: "Doe"
    })
    lastName: string;

    @ApiProperty({
        type: String,
        description: "User's first name",
        example: "John"
    })
    firstName: string;
        
    @ApiProperty({
        type: String,
        description: "User's email address",
        example: "john.doe@example.com"
    })
    email: string;
}