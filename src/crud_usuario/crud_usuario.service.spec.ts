import { Test, TestingModule } from '@nestjs/testing';
import { CrudUsuarioService } from './crud_usuario.service';

describe('CrudUsuarioService', () => {
  let service: CrudUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudUsuarioService],
    }).compile();

    service = module.get<CrudUsuarioService>(CrudUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
