import { IsDecimal, IsString, MinLength } from "class-validator";

export class UpdateUserDetailsDto {

    @IsString()
    @MinLength(3)
    firstname: string;

    @IsString()
    @MinLength(3)
    lastname: string;

}