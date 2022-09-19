import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { Logger } from 'winston';

@EntityRepository(Task)
@Injectable()
export class TasksRepository extends Repository<Task> {
    @Inject('winston')
    private readonly logger: Logger
    constructor(private authService: AuthService){
        super();
    }
    
    tasksServices: any;

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>{
        const { status, account_holder}  = filterDto;
        const query = this.createQueryBuilder('task');
        query.where({ user});
        if(status){
            query.andWhere('task.status = :status', {status});
        }

        if (account_holder) {
            query.andWhere(
              '(task.account_holder = :account_holder)',{ account_holder: `${account_holder}` },
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
        const account_holder = user.id;

        const task = this.create({
            amount,
            description,
            status: TaskStatus.DEPOSITED,
            account_holder,
            user
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
        const { amount,description,account_holder} = requestTaskDto;
        
        const task = this.create({
            amount,
            description,
            status: TaskStatus.REQUESTED,
            user,
            account_holder
        });

        try{
           const task_status =  await this.save(task);
            return task;
        } catch (error){
            this.logger.error(`Failed to get tasks`,error.stack);
            throw new InternalServerErrorException();
        }
    }

    async transferTask(transferTaskDto : TransferTaskDto, user: User): Promise<Task>{
        const { amount,description,account_holder} = transferTaskDto;

        const balance = await this.checkBalance(user);
        const commision =  (amount*2)/100;
        console.log(balance['sum']);
       

        if(balance && balance['sum'] >= (amount + commision)){
            this.logger.verbose(`Your account balance is -  "${balance['sum']}"`);
        
            const task = this.create({
                amount,
                description,
                status: TaskStatus.DEPOSITED,
                user,
                account_holder,
            });

            try{
                const task_status =  await this.save(task);
                this.logger.verbose(`this is result ${task_status}`);
                if(task_status){
                    const rootuser = '9eac742d-4623-4490-976c-f268d20cbcc4';
                    
                    //debit amount from user account
                    const debited_from_user = this.create({
                        amount: -amount,
                        description: 'Amount transfered',
                        status: TaskStatus.DEBITED,
                        account_holder: task_status.user.id,
                        user,
                    });
                    await this.save(debited_from_user);
                    
                    //transfer Commision
                    const transfer_to_admin = this.create({
                        amount:commision,
                        description: 'As a commision',
                        status: TaskStatus.DEPOSITED,
                        account_holder: rootuser,
                        user
                    });
                    await this.save(transfer_to_admin);

                    //debited commision amount
                    const debited_commision_from_user = this.create({
                        amount: -commision,
                        description: 'Commision paid to root user',
                        status: TaskStatus.DEBITED,
                        account_holder: task_status.user.id,
                        user,
                    });
                    await this.save(debited_commision_from_user);
                }
                return task;
            } catch (error){
                this.logger.error(`Failed to get tasks`,error.stack);
                throw new InternalServerErrorException();
            }
        }else{
            this.logger.error(`user "${user.username}" Account balance is not sufficient to transfer "${amount}"`);
            throw new Error('Account balance is not sufficient');
        }
        
    }
    async checkBalance(user: User): Promise<Task>{
        const user_id =  user.id;
        try{
            const sum = await this.createQueryBuilder("task")
             .select("SUM(task.amount)", "sum")
             .where("task.account_holder = :account_holder", { account_holder: user_id})
             .getRawOne()
             
            this.logger.verbose(`Your account balance is from verify balance function -  ${JSON.stringify(sum)}`);
            return sum;
        } catch( e){
            
            this.logger.error('Calling checkBalance()', e.stack, TasksRepository.name);
            throw new InternalServerErrorException();
        }
    }

}