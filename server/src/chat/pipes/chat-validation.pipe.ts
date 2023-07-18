import {
  // ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class FindTargetNickname {
  target_nickname: string;
}
