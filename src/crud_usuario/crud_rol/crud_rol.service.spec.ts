import { Test, TestingModule } from '@nestjs/testing';
import { CrudRolService } from './crud_rol.service';

describe('CrudRolService', () => {
  let service: CrudRolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrudRolService],
    }).compile();

    service = module.get<CrudRolService>(CrudRolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
