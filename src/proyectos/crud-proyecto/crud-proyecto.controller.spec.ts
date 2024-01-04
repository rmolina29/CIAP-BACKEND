import { Test, TestingModule } from '@nestjs/testing';
import { CrudProyectoController } from './crud-proyecto.controller';
import { CrudProyectoService } from './crud-proyecto.service';

describe('CrudProyectoController', () => {
  let controller: CrudProyectoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrudProyectoController],
      providers: [CrudProyectoService],
    }).compile();

    controller = module.get<CrudProyectoController>(CrudProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
