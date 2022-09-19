import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersRepository } from 'src/auth/users.repository';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { AuthService } from 'src/auth/auth.service';
import { RequestTaskDto } from './dto/request-task.dto';
import { TransferTaskDto } from './dto/transfer-task.dto';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
    constructor(private authService: AuthService){
        super();
    }
    
    private logger = new Logger('TasksRepository');
    tasksServices: any;

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>{
        const { status, search}  = filterDto;
        const query = this.createQueryBuilder('task');
        query.where({ user});
        if(status){
            query.andWhere('task.status = :status', {status});
        }

        if (search) {
            query.andWhere(
              '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
              { search: `%${search}%` },
            );
          }
        try{
            const tasks =  await query.getMany();
            return tasks;
        } catch( error){
            this.logger.error(`Failed to get tasks`,error.stack);
            throw new InternalServerErrorException();
        }
    }
    async createTask(createTaskDto : CreateTaskDto, user: User): Promise<Task>{
        const { amount,description} = createTaskDto;
        const requested_by = user.id;

        const task = this.create({
            amount,
            description,
            status: TaskStatus.DEPOSITED,
            user,
            requested_by
        });

        try{
           const task_status =  await this.save(task);
            return task;
        } catch (error){
            this.logger.error(`Failed to get tasks`,error.stack);
            throw new InternalServerErrorException();
        }
    }

    async requestTask(requestTaskDto : RequestTaskDto, user: User): Promise<Task>{
        const { amount,description,requested_by} = requestTaskDto;
        
        const task = this.create({
            amount,
            description,
            status: TaskStatus.REQUESTED,
            user,
            requested_by
        });

        try{
           const task_status =  await this.save(task);
            return task;
        } catch (error){
            this.logger.error(`Failed to get tasks`,error.stack);
            throw new InternalServerErrorException();
        }
    }

    async transfertTask(transferTaskDto : TransferTaskDto, user: User): Promise<Task>{
        const { amount,description,requested_by} = transferTaskDto;
        //todo: check balance before transfer
        const task = this.create({
            amount,
            description,
            status: TaskStatus.DEPOSITED,
            user,
            requested_by,
        });

        try{
            const task_status =  await this.save(task);
            if(task_status){
                
                const commision =  (amount*2)/100;

                const transfer_to_admin = this.create({
                    amount:commision,
                    description: 'As a commision',
                    status: TaskStatus.DEPOSITED,
                    requested_by: task_status.user.id,
                    user,
                });     
            }
            return task;
        } catch (error){
            this.logger.error(`Failed to get tasks`,error.stack);
            throw new InternalServerErrorException();
        }
    }
}