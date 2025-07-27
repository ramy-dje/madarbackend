import { Test, TestingModule } from '@nestjs/testing';
import { CRMService } from './crm.service';

describe('CRMService', () => {
  let service: CRMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CRMService],
    }).compile();

    service = module.get<CRMService>(CRMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
