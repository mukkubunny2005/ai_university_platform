import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CourseSemestersController } from './course-semesters.controller';
import { CourseSemestersService } from './course-semesters.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourseSemestersController],
  providers: [CourseSemestersService],
  exports: [CourseSemestersService],
})
export class CourseSemestersModule {}
