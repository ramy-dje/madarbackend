import { Test, TestingModule } from '@nestjs/testing';
import { OccupationController } from './occupation.controller';

describe('OccupationController', () => {
  let controller: OccupationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupationController],
    }).compile();

    controller = module.get<OccupationController>(OccupationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
