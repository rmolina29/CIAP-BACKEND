import { Body, Controller, Get, HttpStatus, Post, Put, Res, UseGuards } from "@nestjs/common";
import { CrudDireccionService } from "./crud-direccion.service";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { MensajeAlerta, Registro, RespuestaPeticion } from "src/mensajes_usuario/mensajes-usuario.enum";
import { DireccionDto, EstadoDireccion } from "./dto/create-crud-direccion.dto";
import { GuardParametros } from "../guards/validacionParametros.guard";
import { Response } from "express";

@ApiTags('Direccion')
@Controller('unidad-organizativa')
export class DireccionController {
    constructor(
        private readonly direccionServicio: CrudDireccionService) { }


    @Get('/')
    direccion() {
        return this.direccionServicio.obtenerDirecciones()
    }

    @Post('/registrar')
    @ApiBody({ type: DireccionDto, description: 'Se hace el registro de la unidad organizativa.' })
    @ApiOkResponse({ status: 201, description: Registro.EXITO_UNIDAD_ORGANIZATIVA })
    @UseGuards(GuardParametros)
    crearDireccion(@Body() direccion: DireccionDto, @Res() res: Response) {
        this.direccionServicio.registrarDireccion(direccion);
        res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_UNIDAD_ORGANIZATIVA, status: RespuestaPeticion.OK });
    }


    @Put('/actualizar')
    @ApiBody({ type: DireccionDto, description: 'Se hace la actualizacion de la unidad organizativa.' })
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


    @Put('/actualizar-estado')
    @ApiBody({ type: EstadoDireccion, description: 'Se hace la actualizacion del estado de la gerencia a activo o inactivo.' })
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