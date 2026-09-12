import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { FacultyModule } from './faculty/faculty.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { BatchesModule } from './batches/batches.module';
import { SectionsModule } from './sections/sections.module';
import { CourseSemestersModule } from './course-semesters/course-semesters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    FacultyModule,
    DepartmentsModule,
    CoursesModule,
    SubjectsModule,
    AcademicYearsModule,
    BatchesModule,
    SectionsModule,
    CourseSemestersModule,
  ],
})
export class AppModule {}
