import { PartialType } from '@nestjs/swagger';
import { CreateAdPositionDto } from './create-ad-position.dto';

export class UpdateAdPositionDto extends PartialType(CreateAdPositionDto) {}
