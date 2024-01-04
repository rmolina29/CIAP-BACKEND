import { IsDateString } from "class-validator";

export class Proyectos {


    id:number;

    numeroContrato:string;

    objeto:string;

    estado:number;

    cliente:number;

    gerencia:number;

    gerente:number;

    @IsDateString()
    valorInicial:number;

    valorFinal:number;

    fechaInicio:Date;

    fechaFinal:Date;

    duracion:number;

}
