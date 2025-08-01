import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
    return new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API для аутентификации и авторизации пользователей')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Операции аутентификации')
    .addTag('posts', 'Управление статьями')
    .setContact(
      'TG',
      '@king_14li',
      'qeertui@mail.ru'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Локальное окружение')
    .addServer('https://api.example.com', 'Продакшн окружение')
    .build();
}