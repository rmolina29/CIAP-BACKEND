import { Test, TestingModule } from '@nestjs/testing';
import { CrudClienteService } from './crud-cliente.service';

describe('CrudClienteService', () => {
  let service: CrudClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudClienteService],
    }).compile();

    service = module.get<CrudClienteService>(CrudClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
