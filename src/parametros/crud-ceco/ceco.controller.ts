import { Body, Controller, Get, HttpStatus, Post, Put, Res, UseGuards } from '@nestjs/common';
import { CrudCecoService } from './crud-ceco.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Ceco, CecoEstado } from './dto/create-crud-ceco.dto';
import { MensajeAlerta, Registro, RespuestaPeticion } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { GuardParametros } from '../guards/validacionParametros.guard';
import { Response } from 'express';

@Controller('ceco')
export class CecoController {

    constructor(
        private readonly cecoServicio: CrudCecoService) { }

    @ApiTags('Ceco')
    @Get('/')
    obtenerCeco() {
        return this.cecoServicio.ceco()
    }

    @ApiTags('Ceco')
    @Post('/registrar')
    @ApiBody({ type: Ceco, description: 'Se hace el registro de la unidad de gerencia.' })
    @ApiOkResponse({ status: 201, description: Registro.EXITO_CECO })
    @UseGuards(GuardParametros)
    async crearCeco(@Body() ceco: Ceco, @Res() res: Response) {
        await this.cecoServicio.registrarCeco(ceco);
        res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_CECO, status: RespuestaPeticion.OK });
    }

    @ApiTags('Ceco')
    @Put('/actualizar')
    @ApiBody({ type: Ceco, description: 'Se hace la actualizacion de proyecto ceco.' })
    @ApiOkResponse({ status: 200, description: 'Actualizacion de la informacion del ceco.' })
    @UseGuards(GuardParametros)
    actualizarGerencia(@Body() gerencia: Ceco, @Res() res: Response) {
        try {
            this.cecoServicio.actualizarCeco(gerencia);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el ceco correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }

    @ApiTags('Ceco')
    @Put('/actualizar-estado')
    @ApiBody({ type: Ceco, description: 'Se hace la actualizacion del estado de la gerencia a activo o inactivo.' })
    @ApiOkResponse({ status: 200, description: 'Estado del Ceco actualizada.' })
    actualizarEstadoCeco(@Body() estadoCeco: CecoEstado, @Res() res: Response) {
        try {
            this.cecoServicio.actualizarEstado(estadoCeco);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }
}