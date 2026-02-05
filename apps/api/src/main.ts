import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for session management
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.APP_URL,
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('HumanLine HR API')
    .setDescription('Multi-tenant HR/Employee Management API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('organizations', 'Organization management')
    .addTag('users', 'User management')
    .addTag('branches', 'Branch management')
    .addTag('departments', 'Department management')
    .addTag('job-titles', 'Job title management')
    .addTag('employments', 'Employment management')
    .addTag('work-schedules', 'Work schedule management')
    .addTag('attendance', 'Attendance tracking')
    //  .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add logo for Postman import
  document.info['x-logo'] = {
    url: 'https://avatars.githubusercontent.com/u/1?s=200&v=4',
    altText: 'HumanLine HR Logo',
  };

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);

  console.log(`Application is running on: http://localhost:3001`);
  console.log(`Swagger docs available at: http://localhost:3001/api/docs`);
}
void bootstrap();
