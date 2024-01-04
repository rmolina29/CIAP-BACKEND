import { Test, TestingModule } from '@nestjs/testing';
import { CrudProyectoService } from './crud-proyecto.service';

describe('CrudProyectoService', () => {
  let service: CrudProyectoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudProyectoService],
    }).compile();

    service = module.get<CrudProyectoService>(CrudProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
