import { PartialType } from '@nestjs/swagger';
import { CreateAdCommentDto } from './create-ad-comment.dto';

export class UpdateAdCommentDto extends PartialType(CreateAdCommentDto) {}
