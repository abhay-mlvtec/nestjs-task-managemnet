import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'assgnment_transaction',
      autoLoadEntities: true,
      synchronize: true,
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({ filename: "error.log", level: "warn" }),
        new winston.transports.File({ filename: "console.log", level: "verbose" }),
        new winston.transports.File({ filename: "combined.log" }),
        new winston.transports.Console(),
      ],
    }),
    AuthModule,
  ],
})
export class AppModule {}
