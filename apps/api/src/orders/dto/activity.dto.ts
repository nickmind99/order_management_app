import { ApiProperty } from '@nestjs/swagger';
import { ACTIVITY_PERIODS, type ActivityPeriod } from './activity-query.dto';

export class ActivityOrderDto {
  number!: string;
  completedAt!: Date;
  totalCents!: number;
}

export class ActivityDto {
  @ApiProperty({ enum: ACTIVITY_PERIODS })
  period!: ActivityPeriod;
  from!: Date;
  to!: Date;
  completed!: number;
  spendCents!: number;
  avgPerOrderCents!: number;
  previousCompleted!: number;
  completedChangePct!: number | null;
  orders!: ActivityOrderDto[];
}
