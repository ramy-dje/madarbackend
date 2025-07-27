import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';
import { Chart, ChartSchema } from './schemas/chart.schema';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chart.name, schema: ChartSchema },
      { name: 'Users', schema: UserSchema },
    ]),
  ],
  controllers: [ChartsController],
  providers: [ChartsService],
  exports: [ChartsService],
})
export class ChartsModule {}
