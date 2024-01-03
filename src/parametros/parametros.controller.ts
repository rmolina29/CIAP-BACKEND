import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { Response } from 'express';
import { CrudClienteService } from './crud-cliente/crud-cliente.service';
import { CrudCecoService } from './crud-ceco/crud-ceco.service';
import { CrudGerenciaService } from './crud-gerencia/crud-gerencia.service';
import { CrudEstadosService } from './crud-estados/crud-estados.service';
import { CrudDireccionService } from './crud-direccion/crud-direccion.service';
import { Gerencia, Estado } from './crud-gerencia/dto/create-crud-gerencia.dto';
import { MensajeAlerta, Registro, RespuestaPeticion } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DireccionDto, EstadoDireccion } from './crud-direccion/dto/create-crud-direccion.dto';
import { GuardParametros } from './guards/validacionParametros.guard';

@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService,
    private readonly clienteServicio: CrudClienteService,
    private readonly cecoServicio: CrudCecoService,
    private readonly estadoServicio: CrudEstadosService,
    private readonly gerenciaServicio: CrudGerenciaService,
    private readonly direccionServicio: CrudDireccionService) { }

  @ApiTags('Gerencia')
  @Get('/responsables')
  responsable() {
    return this.gerenciaServicio.obtenerResponsables();
  }

  @ApiTags('Gerencia')
  @Get('/gerencia')
  gerencia() {
    return this.gerenciaServicio.obtenerGerencias();
  }

  @ApiTags('Gerencia')
  @Post('/registrar/gerencia')
  @ApiBody({ type: Gerencia, description: 'Se hace el registro de la unidad de gerencia.' })
  @ApiOkResponse({ status: 201, description: Registro.EXITO_GERENCIA })
  @UseGuards(GuardParametros)
  async crearGerencia(@Body() gerencia: Gerencia, @Res() res: Response) {
    await this.gerenciaServicio.registrar(gerencia);
    res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_GERENCIA, status: RespuestaPeticion.OK });
  }

  @ApiTags('Gerencia')
  @Put('/actualizar/gerencia')
  @ApiBody({ type: Gerencia, description: 'Se hace la actualizacion de la unidad de gerencia.' })
  @ApiOkResponse({ status: 200, description: Registro.EXITO_GERENCIA })
  @UseGuards(GuardParametros)
  actualizarGerencia(@Body() gerencia: Gerencia, @Res() res: Response) {
    try {
      this.gerenciaServicio.actualizar(gerencia);
      res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado la gerencia correctamente', status: RespuestaPeticion.OK })
    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    }
  }

  @ApiTags('Gerencia')
  @Put('/actualizar-estado/gerencia')
  @ApiBody({ type: Estado, description: 'Se hace la actualizacion del estado de la gerencia a activo o inactivo.' })
  @ApiOkResponse({ status: 200, description: 'Estado de la gerencia actualizada.' })
  actualizarEstadoGerencia(@Body() estadoGerencia: Estado, @Res() res: Response) {
    try {
      this.gerenciaServicio.actualizarEstado(estadoGerencia);
      res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    }
  }



  @ApiTags('Direccion')
  @Get('/direccion')
  direccion() {
    return this.direccionServicio.obtenerDirecciones()
  }


  @ApiTags('Direccion')
  @Post('/registrar/direccion')
  @ApiBody({ type: DireccionDto, description: 'Se hace el registro de la unidad de gerencia.' })
  @ApiOkResponse({ status: 201, description: Registro.EXITO_GERENCIA })
  @UseGuards(GuardParametros)
  crearDireccion(@Body() direccion: DireccionDto, @Res() res: Response) {
    this.direccionServicio.registrarDireccion(direccion);
    res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_GERENCIA, status: RespuestaPeticion.OK });
  }


  @ApiTags('Direccion')
  @Put('/actualizar/direccion')
  @ApiBody({ type: DireccionDto, description: 'Se hace la actualizacion de la unidad de Direccion.' })
  @ApiOkResponse({ status: 200, description: Registro.EXITO_GERENCIA })
  @UseGuards(GuardParametros)
  actualizarDireccion(@Body() direccion: DireccionDto, @Res() res: Response) {
    try {
      this.direccionServicio.actualizarDireccion(direccion);
      res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado la direccion correctamente', status: RespuestaPeticion.OK })
    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    }
  }


  @ApiTags('Direccion')
  @Put('/actualizar-estado/direccion')
  @ApiBody({ type: Estado, description: 'Se hace la actualizacion del estado de la gerencia a activo o inactivo.' })
  @ApiOkResponse({ status: 200, description: 'Estado de la gerencia actualizada.' })
  actualizarEstadoDireccion(@Body() estadoDireccion: EstadoDireccion, @Res() res: Response) {
    try {
      this.direccionServicio.actualizarEstado(estadoDireccion);
      res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    }
  }




}
