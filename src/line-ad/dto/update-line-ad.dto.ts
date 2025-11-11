import { PartialType } from '@nestjs/mapped-types';
import { CreateLineAdDto } from './create-line-ad.dto';

export class UpdateLineAdDto extends PartialType(CreateLineAdDto) {}
