import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();
import { config } from 'dotenv';
config();

export default new DataSource({
  type: "postgres",
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  username: configService.getOrThrow('POSTGRES_USER'),
  password: configService.getOrThrow('POSTGRES_PASSWORD'),
  database: configService.getOrThrow('POSTGRES_DATABASE'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
});

