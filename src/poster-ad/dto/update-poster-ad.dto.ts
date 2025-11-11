import { PartialType } from '@nestjs/swagger';
import { CreatePosterAdDto } from './create-poster-ad.dto';

export class UpdatePosterAdDto extends PartialType(CreatePosterAdDto) {}
