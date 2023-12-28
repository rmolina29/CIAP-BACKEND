import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';

@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Post()
  create(@Body() createParametroDto: CreateParametroDto) {
    return this.parametrosService.create(createParametroDto);
  }

  @Get()
  findAll() {
    return this.parametrosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametrosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParametroDto: UpdateParametroDto) {
    return this.parametrosService.update(+id, updateParametroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametrosService.remove(+id);
  }
}
