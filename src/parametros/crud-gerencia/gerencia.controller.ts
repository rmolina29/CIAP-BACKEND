import { Controller, Get, Post, Body, Put,UseGuards, Res, HttpStatus } from '@nestjs/common';
import { MensajeAlerta, Registro, RespuestaPeticion } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GuardParametros } from '../guards/validacionParametros.guard';
import { CrudGerenciaService } from './crud-gerencia.service';
import { Estado, Gerencia } from './dto/create-crud-gerencia.dto';

@Controller('gerencia')
export class GerenciaContoller {
    constructor(
        private readonly gerenciaServicio: CrudGerenciaService,
    ) { }

    @ApiTags('Gerencia')
    @Get('/responsables')
    responsable() {
        return this.gerenciaServicio.obtenerResponsables();
    }

    @ApiTags('Gerencia')
    @Get('/')
    gerencia() {
        return this.gerenciaServicio.obtenerGerencias();
    }
    @ApiTags('Gerencia')
    @Get('/activas')
    gerenciaActivos() {
        return this.gerenciaServicio.obtenerGerenciasActivas();
    }

    @ApiTags('Gerencia')
    @Post('/registrar')
    @ApiBody({ type: Gerencia, description: 'Se hace el registro de la unidad de gerencia.' })
    @ApiOkResponse({ status: 201, description: Registro.EXITO_GERENCIA })
    @UseGuards(GuardParametros)
    async crearGerencia(@Body() gerencia: Gerencia, @Res() res: Response) {
        await this.gerenciaServicio.registrar(gerencia);
        res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_GERENCIA, status: RespuestaPeticion.OK });
    }

    @ApiTags('Gerencia')
    @Put('/actualizar')
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
    @Put('/actualizar-estado')
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
}