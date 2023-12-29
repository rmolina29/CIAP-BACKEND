import { Test, TestingModule } from '@nestjs/testing';
import { CrudCecoService } from './crud-ceco.service';

describe('CrudCecoService', () => {
  let service: CrudCecoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudCecoService],
    }).compile();

    service = module.get<CrudCecoService>(CrudCecoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
