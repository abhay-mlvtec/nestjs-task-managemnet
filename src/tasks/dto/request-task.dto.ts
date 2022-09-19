import { IsNotEmpty } from 'class-validator';

export class RequestTaskDto {
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    account_holder: string
}