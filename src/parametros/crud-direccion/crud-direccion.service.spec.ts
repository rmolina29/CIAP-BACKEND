import { Test, TestingModule } from '@nestjs/testing';
import { CrudDireccionService } from './crud-direccion.service';

describe('CrudDireccionService', () => {
  let service: CrudDireccionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudDireccionService],
    }).compile();

    service = module.get<CrudDireccionService>(CrudDireccionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
