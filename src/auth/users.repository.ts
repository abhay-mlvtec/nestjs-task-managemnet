import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { Task } from 'src/tasks/task.entity';
import { AuthSignUpDto } from './dto/auth-signup.dto';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
    private logger = new Logger('UserRepository'); 
    static save(task: Task) {
        throw new Error('Method not implemented.');
    }
    async createUser(authSignUpDto: AuthSignUpDto) : Promise<void>{
        const { firstname, lastname , username, password } = authSignUpDto;
        //const { firstname, lastname } = updateUserDetailsDto || {};
       // this.logger.verbose(updateUserDetailsDto);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password,salt)
        const user = this.create({
            firstname,
            lastname,
            username,
            password: hashedPassword,
            
         });
        try{
            await this.save(user);
        } catch (error){
            if(error.code === '23505'){
                // duplicate USer
                throw new ConflictException('Username already Exist');
            }
            else{
                throw new InternalServerErrorException()
            }
            console.log(error.code);
        }
        
    }
}
