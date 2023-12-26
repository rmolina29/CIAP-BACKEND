import { Test, TestingModule } from '@nestjs/testing';
import { RolMenuService } from './rol-menu.service';

describe('RolMenuService', () => {
  let service: RolMenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolMenuService],
    }).compile();

    service = module.get<RolMenuService>(RolMenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
