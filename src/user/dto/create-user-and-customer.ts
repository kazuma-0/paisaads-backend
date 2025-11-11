import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { GENDER } from 'src/common/enums/gender.enum';

export class CreateUserAndCustomerDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  secondary_number: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  country: string;
  @IsNotEmpty()
  country_id: string;
  @IsNotEmpty()
  state: string;
  @IsNotEmpty()
  state_id: string;
  @IsNotEmpty()
  city: string;
  @IsNotEmpty()
  city_id: string;
  @IsOptional()
  proof: string; // image id
  @IsNotEmpty()
  gender: GENDER;
}
