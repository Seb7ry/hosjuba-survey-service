export class UpdateCaseDto {
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
    readonly calificacion?: {
        efectividad: number;
        satisfaccion: number;
    };
    readonly estado?: string;
    readonly addData?: Record<string, any>;
}
