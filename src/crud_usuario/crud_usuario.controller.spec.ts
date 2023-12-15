import { Test, TestingModule } from '@nestjs/testing';
import { CrudUsuarioController } from './crud_usuario.controller';

describe('CrudUsuarioController', () => {
  let controller: CrudUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrudUsuarioController],
    }).compile();

    controller = module.get<CrudUsuarioController>(CrudUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
