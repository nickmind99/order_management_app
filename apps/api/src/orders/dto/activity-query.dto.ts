import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const ACTIVITY_PERIODS = ['day', 'week', 'month', 'quarter'] as const;
export type ActivityPeriod = (typeof ACTIVITY_PERIODS)[number];

export class ActivityQueryDto {
  @ApiPropertyOptional({ enum: ACTIVITY_PERIODS, default: 'month' })
  @IsOptional()
  @IsIn(ACTIVITY_PERIODS)
  period: ActivityPeriod = 'month';
}
