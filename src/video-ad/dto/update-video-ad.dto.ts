import { PartialType } from '@nestjs/swagger';
import { CreateVideoAdDto } from './create-video-ad.dto';

export class UpdateVideoAdDto extends PartialType(CreateVideoAdDto) {}
