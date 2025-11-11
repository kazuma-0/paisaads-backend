import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  country: string;
  @IsOptional()
  country_id: string;
  @IsOptional()
  state: string;
  @IsOptional()
  state_id: string;
  @IsOptional()
  city: string;
  @IsOptional()
  city_id: string;
}
