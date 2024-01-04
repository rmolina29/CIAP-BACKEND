import { IsDateString } from "class-validator";

export class Proyectos {


    id: number;

    numeroContrato: string;

    objeto: string;

    estado: number;

    cliente: number;

    gerencia: number;

    gerente: number;


    valorInicial: number;

    valorFinal: number;

    @IsDateString({ strict: true, strictSeparator: true }, { message: 'la fecha debe tener el formato YYYY-MM-DD' })
    fechaInicio: string;

    @IsDateString({ strict: true, strictSeparator: true }, { message: 'la fecha debe tener el formato YYYY-MM-DD' })
    fechaFinal: string;

    duracion: number;

}
