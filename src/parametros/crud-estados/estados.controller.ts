import { Body, Controller, Get, HttpStatus, Post, Put, Res, UseGuards } from "@nestjs/common";
import { CrudEstadosService } from "./crud-estados.service";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { MensajeAlerta, Registro, RespuestaPeticion } from "src/mensajes_usuario/mensajes-usuario.enum";
import { Estado, EstadosDto } from "./dto/create-crud-estado.dto";
import { Response } from "express";
import { GuardParametros } from "../guards/validacionParametros.guard";

@ApiTags('Estados')
@Controller('estados')
export class EstadosController {

    constructor(private readonly estadoServicio: CrudEstadosService) { }


    @Get('/')
    estados() {
        return this.estadoServicio.obtenerEstados()
    }

    @Post('/registrar')
    @ApiBody({ type: EstadosDto, description: 'Se hace el registro el estado correctamente.' })
    @ApiOkResponse({ status: 201, description: Registro.EXITO_ESTADOS })
    @UseGuards(GuardParametros)
    crearEstado(@Body() estados: EstadosDto, @Res() res: Response) {
        try {
            this.estadoServicio.crearEstado(estados);
            res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_ESTADOS, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }

    }

    @Put('/actualizar')
    @ApiBody({ type: EstadosDto, description: 'Se hace la actualizacion de la unidad de Direccion.' })
    @ApiOkResponse({ status: 200, description: 'Se realiza la actualizacion del Estado de los parametros.'})
    @UseGuards(GuardParametros)
    actualizarEstado(@Body() estados: EstadosDto, @Res() res: Response) {
        try {
            this.estadoServicio.actualizar(estados);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }


    @Put('/actualizar-estado')
    @ApiBody({ type: Estado, description: 'Se hace la actualizacion del estado a activo o inactivo.' })
    @ApiOkResponse({ status: 200, description: 'Estado actualizada.' })
    activarDesactivarEstado(@Body() estado: Estado, @Res() res: Response) {
        try {
            this.estadoServicio.actualizarEstado(estado);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }
}