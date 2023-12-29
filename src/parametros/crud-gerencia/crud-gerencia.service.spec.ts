import { Test, TestingModule } from '@nestjs/testing';
import { CrudGerenciaService } from './crud-gerencia.service';

describe('CrudGerenciaService', () => {
  let service: CrudGerenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudGerenciaService],
    }).compile();

    service = module.get<CrudGerenciaService>(CrudGerenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
