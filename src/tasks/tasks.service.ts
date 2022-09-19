import { Injectable, NotFoundException } from '@nestjs/common';
import {TaskStatus} from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';
import { use } from 'passport';
import { RequestTaskDto } from './dto/request-task.dto';
import { TransferTaskDto } from './dto/transfer-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TasksRepository)
        private tasksRepository: TasksRepository,
    ){}
    // //private tasks: Task[] = [];

    // getAllTasks():Task[] {
    //     return this.tasks;
    // }

    // getTaskWithFilters(filterDto: GetTasksFilterDto): Task[] {
    //     const {status, search} = filterDto;

    //     let tasks = this.getAllTasks();

    //     if(status){
    //         tasks = tasks.filter((task) => task.status === status);
    //     }

    //     if(search){
    //         tasks = tasks.filter((task) => {
    //             if(task.title.includes(search) || task.description.includes(search)) {
    //                 return true;
    //             }
    //         });
    //     }

    //     return tasks;
    // }
    
    
    getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>{
        return this.tasksRepository.getTasks(filterDto, user);
    }
    async getTaskById(id: string, user : User): Promise<Task> {
         const found = await this.tasksRepository.findOne(
            { where:
                { id: id }
            }
        );

         if(!found){
             throw new NotFoundException(`${id} and ${JSON.stringify(user)}`);
         }
         return found;
    }

    async deleteTask(id: string, user: User): Promise<void> {
         const result = await this.tasksRepository.delete({id,user});
         if(result.affected === 0){
            throw new NotFoundException();
         }
    }

    async updateTaskStatus(id: string, user: User): Promise<Task> {
        const task = await  this.getTaskById(id, user);
        task.status = TaskStatus.DEPOSITED

        const account_holder = task.account_holder;

        await this.tasksRepository.save(task);

        const verify_balance = this.tasksRepository.checkBalance(user);
        //todo: check user exist before transfer
        if(verify_balance['sum'] >= task.amount){
            const depositer_bal = {
                amount: -task.amount,
                description: 'Deposited as per request',
                status: TaskStatus.DEBITED,
                account_holder: account_holder,
                user,
            }
            this.tasksRepository.createTask(depositer_bal,user);
            return task;
        }else{
            throw new Error('Account balance is not sufficient');
        }
    }

    createTask(createTaskDto : CreateTaskDto, user: User): Promise<Task> {
        return this.tasksRepository.createTask(createTaskDto,user);
    }

    requestTask(requestTaskDto : RequestTaskDto, user: User): Promise<Task> {
        return this.tasksRepository.requestTask(requestTaskDto,user);
    }

    transferTask(transferTaskDto : TransferTaskDto, user: User): Promise<Task> {
        return this.tasksRepository.transferTask(transferTaskDto,user);
    }
}
