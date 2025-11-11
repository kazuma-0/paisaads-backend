import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TeamMemberDto {
  @ApiProperty({ description: 'Team member name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Team member position' })
  @IsString()
  position: string;

  @ApiProperty({ description: 'Team member bio' })
  @IsString()
  bio: string;

  @ApiProperty({ description: 'Team member image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}

export class AboutUsDto {
  @ApiProperty({ description: 'Page title', example: 'About Paisa Ads' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Main about us content in HTML or markdown format',
  })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Company mission statement', required: false })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiProperty({ description: 'Company vision statement', required: false })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiProperty({
    description: 'Company values',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];

  @ApiProperty({ description: 'Year company was founded', required: false })
  @IsOptional()
  @IsNumber()
  foundedYear?: number;

  @ApiProperty({ description: 'Founder name', required: false })
  @IsOptional()
  @IsString()
  founderName?: string;

  @ApiProperty({ description: 'Company description', required: false })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiProperty({
    description: 'Team members',
    type: [TeamMemberDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @ApiProperty({ description: 'User who updated the content', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether content is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
