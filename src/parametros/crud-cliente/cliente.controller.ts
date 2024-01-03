import { Body, Controller, Get, HttpStatus, Post, Put, Res, UseGuards } from '@nestjs/common';
import { CrudClienteService } from './crud-cliente.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Cliente, EstadoCLiente } from './dto/create-crud-cliente.dto';
import { MensajeAlerta, Registro, RespuestaPeticion } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { GuardParametros } from '../guards/validacionParametros.guard';
import { Response } from 'express';

@ApiTags('Cliente')
@Controller('cliente')
export class ClienteController {
    constructor(private readonly clienteServicio: CrudClienteService) { }

    @Get('/')
    obtenerClientes() {
        return this.clienteServicio.clientes();
    }

    @Post('/registrar')
    @ApiBody({ type: Cliente, description: 'Se hace el registro de los clientes.' })
    @ApiOkResponse({ status: 201, description: Registro.EXITO_CLIENTE })
    @UseGuards(GuardParametros)
    async crearCliente(@Body() cliente: Cliente, @Res() res: Response) {
        await this.clienteServicio.registrarCliente(cliente);
        res.status(HttpStatus.CREATED).json({ mensaje: Registro.EXITO_CLIENTE, status: RespuestaPeticion.OK });
    }

    @Put('/actualizar')
    @ApiBody({ type: Cliente, description: 'Se hace la actualizacion del Cliente.' })
    @ApiOkResponse({ status: 200, description: 'Actualizacion de la informacion del Cliente.' })
    @UseGuards(GuardParametros)
    actualizarCliente(@Body() cliente: Cliente, @Res() res: Response) {
        try {
            this.clienteServicio.actualizarCliente(cliente);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el cliente correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }

    @Put('/actualizar-estado')
    @ApiBody({ type: EstadoCLiente, description: 'Se hace la actualizacion del estado de la gerencia a activo o inactivo.' })
    @ApiOkResponse({ status: 200, description: 'Estado del Ceco actualizada.' })
    actualizarEstadoCeco(@Body() estadoCliente: EstadoCLiente, @Res() res: Response) {
        try {
            this.clienteServicio.actualizarEstado(estadoCliente);
            res.status(HttpStatus.OK).json({ mensaje: 'Se ha actualizado el estado correctamente', status: RespuestaPeticion.OK })
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }
}

