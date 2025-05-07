export class CreateCaseDto {
  readonly numeroCaso: string;
  readonly dependencia: string;
  readonly funcionario: string;
  readonly cargoFuncionario: string;
  readonly firmaTecnico?: {
      nombre: string;
      cargo: string;
      firma: string;  // Base64 o URL
  };
  readonly firmaUsuario?: {
      nombre: string;
      cargo: string;
      firma: string;  // Base64 o URL
  };
  readonly calificacion: {
      efectividad: number;
      satisfaccion: number;
  };
  readonly estado?: string;  // 'pendiente' por defecto
}
