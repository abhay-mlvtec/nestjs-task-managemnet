import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { AuthSignUpDto } from './dto/auth-signup.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private jwtService: JwtService,
    ){}

   async signUp(authSignUpDto: AuthSignUpDto): Promise<void>{
        return this.usersRepository.createUser(authSignUpDto);
   }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken :string}> {
        const {username,password} = authCredentialsDto;
        const user = await this.usersRepository.findOne({username});

        if(user && (await bcrypt.compare(password,user.password))){
            const payload: JwtPayload =  {username};
            const accessToken: string = await this.jwtService.sign(payload);
            return { accessToken };
        } else {
            throw new UnauthorizedException('Please Check your Login credential');
        }
    }

    async deleteUser(id: string): Promise<void> {
        const result = await this.usersRepository.delete({id});
        if(result.affected === 0){
           throw new NotFoundException();
        }
   }
    async getUserById(id: string): Promise<User> {
        const found = await this.usersRepository.findOne({where: {id}});
        if(!found){
            throw new NotFoundException();
        }
        return found;
    }
    async updateUserDetails(id: string,firstname, lastname): Promise<User> {
        const user =  await this.getUserById(id);
         if(!user){
             throw new NotFoundException();
         }
         user.firstname = firstname;
         user.lastname = lastname;
         await this.usersRepository.save(user);
         return user;
    }

    async updateUserAccountBalance(id: string,amount): Promise<User> {
        const user =  await this.getUserById(id);
        if(!user){
            throw new NotFoundException();
        }
        user.amount = amount;
        await this.usersRepository.save(user);
        return user;
    }
}
