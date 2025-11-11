import { IsString } from 'class-validator';

export class TermsAndConditionsDto {
  @IsString()
  content: string;
}
