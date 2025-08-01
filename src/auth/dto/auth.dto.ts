import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
    @ApiProperty({
        type: String,
        description: 'The access token for authenticated users',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpvaG4iOnsic3RyaW5nIn0=',
    })
    accessToken: string;
}