import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    description:  string;

    account_holder: string
}