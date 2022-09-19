import { Body, Controller, Delete, Inject, Injectable, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { User } from './user.entity';
import { Logger } from 'winston';

@Controller('auth')
@Injectable()
export class AuthController {
    @Inject('winston')
   private readonly logger: Logger
    constructor(private authService: AuthService){}

    @Post('/signup')
    signUp(@Body() authSignUpDto: AuthSignUpDto) : Promise<void>{
        //this.logger.verbose(authCredentialsDto);
        return this.authService.signUp(authSignUpDto);
    }

    @Post('/signin')
    signin(@Body() authCredentialsDto:AuthCredentialsDto) : Promise<{accessToken :string}> {
        return this.authService.signIn(authCredentialsDto);
    }

    @UseGuards(AuthGuard())
    @Patch('/:id/firstname/lastname')
    updateUser(
      @Param('id') id: string,
      @Body() updateUserDetailsDto: UpdateUserDetailsDto,
   ): Promise<User> {
      const { firstname,lastname } = updateUserDetailsDto;
      return this.authService.updateUserDetails(id, firstname, lastname);
   }

   @UseGuards(AuthGuard())
    @Delete('/:id')
    deleteUser(@Param('id') id: string,): Promise<void> {
      return this.authService.deleteUser(id);
   }
}
