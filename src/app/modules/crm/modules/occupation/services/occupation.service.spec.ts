import { Test, TestingModule } from '@nestjs/testing';
import { OccupationService } from './occupation.service';

describe('OccupationService', () => {
  let service: OccupationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OccupationService],
    }).compile();

    service = module.get<OccupationService>(OccupationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
