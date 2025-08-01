import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HashUtil } from 'src/auth/utils/hash.util';
import { AuthUtil } from 'src/auth/utils/auth.util';

@Module({
    imports: [
        ConfigModule,
        JwtModule.register({})
    ],
    providers: [HashUtil, AuthUtil, JwtService],
    exports: [HashUtil, AuthUtil],
})
export class SharedModule {}