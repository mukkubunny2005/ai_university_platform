import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 4000;

  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ||
    'http://localhost:3000';

  // ============================================================
  // CORS CONFIGURATION
  // ============================================================

  const allowedOrigins = [
    frontendUrl,
    'https://ai-university-platform.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
    ],
  });

  // ============================================================
  // GLOBAL VALIDATION
  // ============================================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ============================================================
  // GLOBAL EXCEPTION FILTER
  // ============================================================

  app.useGlobalFilters(new HttpExceptionFilter());

  // ============================================================
  // GLOBAL RESPONSE TRANSFORM INTERCEPTOR
  // ============================================================

  app.useGlobalInterceptors(new TransformInterceptor());

  // ============================================================
  // SWAGGER / OPENAPI CONFIGURATION
  // ============================================================

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI University Platform API')
    .setDescription(
      'Phase 1 Production REST API for managing university authentication, students, faculty, departments, courses, and subjects. Architecture ready for Phase 2 university operations and Phase 3 Python FastAPI / RAG / LLM AI services.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'bearer',
    )
    .addTag(
      'Authentication',
      'Registration, login, refresh token rotation, session profile',
    )
    .addTag(
      'Users',
      'User account administration across all roles',
    )
    .addTag(
      'Students',
      'Student profiles, enrollment, semester data',
    )
    .addTag(
      'Faculty',
      'Faculty directory, designations, assigned departments',
    )
    .addTag(
      'Departments',
      'Academic department management',
    )
    .addTag(
      'Courses',
      'Degree programs and course curriculums',
    )
    .addTag(
      'Subjects',
      'Academic subjects, credits, and faculty allocations',
    )
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
    customSiteTitle:
      'AI University Platform - API Documentation',
  });

  // ============================================================
  // START SERVER
  // ============================================================

  await app.listen(port);

  logger.log(
    `🚀 AI University Backend running on port ${port}`,
  );

  logger.log(
    `🌐 Frontend CORS origin: ${frontendUrl}`,
  );

  logger.log(
    `📚 Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
