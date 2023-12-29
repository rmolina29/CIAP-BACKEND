import { Test, TestingModule } from '@nestjs/testing';
import { CrudEstadosService } from './crud-estados.service';

describe('CrudEstadosService', () => {
  let service: CrudEstadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudEstadosService],
    }).compile();

    service = module.get<CrudEstadosService>(CrudEstadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
