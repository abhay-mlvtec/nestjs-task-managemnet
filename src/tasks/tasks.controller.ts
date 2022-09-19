import { Body, Controller, Delete, Get, Inject, Injectable, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { RequestTaskDto } from './dto/request-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { Logger } from 'winston';

@Controller('tasks')
@UseGuards(AuthGuard())
@Injectable()
export class TasksController {
   @Inject('winston')
   private readonly logger: Logger
   constructor(private tasksServices: TasksService, authService: AuthService){}

   @Get()
   async getTasks(
      @Query() filterDto : GetTasksFilterDto,
      @GetUser() user: User,
      ): Promise<Task[]> {
         this.logger.verbose(`user "${user.username}" tried to access getTasks function`);
         return this.tasksServices.getTasks(filterDto, user);   
   }

   @Get('/:id')
   async getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
      return this.tasksServices.getTaskById(id, user);
   }

   @Patch('/:id')
   updateTaskStatus(
      @Param('id') id: string,
      @GetUser() user: User,
   ): Promise<Task> {
      return this.tasksServices.updateTaskStatus( id, user);
   }

   @Delete('/:id')
   deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
      return this.tasksServices.deleteTask(id, user);
   }

   @Post()
   createTask(
      @Body() createTaskDto: CreateTaskDto,
      @GetUser() user:User,
   ): Promise<Task> {
      this.logger.verbose(`user "${user.username}" tried to create new task.Data ${JSON.stringify(createTaskDto)}`);
      const task = this.tasksServices.createTask(createTaskDto, user);
      return task;
   }

   @Post('/request')
   requestTask(
      @Body() requestTaskDto: RequestTaskDto,
      @GetUser() user:User,
   ): Promise<Task> {
      this.logger.verbose(`user "${user.username}" tried to create new task.Data ${JSON.stringify(requestTaskDto)}`);
      const task = this.tasksServices.requestTask(requestTaskDto, user);
      return task;
   }

   @Post('/transfer')
   TransferAmount(
      @Body() requestTaskDto: RequestTaskDto,
      @GetUser() user:User,
   ): Promise<Task> {
      //this.logger.verbose(`user "${user.username}" transfer amount.Data ${JSON.stringify(requestTaskDto)}`);
      const task = this.tasksServices.transferTask(requestTaskDto, user);
      return task;
   }
}
