import { IsNotEmpty } from 'class-validator';

export class TransferTaskDto {
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    description:  string;

    @IsNotEmpty()
    requested_by:string
}