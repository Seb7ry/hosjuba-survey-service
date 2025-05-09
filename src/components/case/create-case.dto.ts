export class CreateCaseDto {
    readonly numeroCaso: string;
    readonly dependencia: string;
    readonly funcionario: string;
    readonly cargoFuncionario: string;
    readonly firmaTecnico: {
        nombre: string;
        cargo: string;
        firma: string;
    };
    readonly firmaUsuario?: {
        nombre: string;
        cargo: string;
        firma: string;
    };
    readonly calificacion: {
        efectividad: number;
        satisfaccion: number;
    };
    readonly estado?: string;
    readonly addData?: Record<string, any>;
}
