import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type CaseDocument = Case & Document;

@Schema({ _id: false })
class Firma {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    cargo: string;

    @Prop({ required: true })
    firma: string;
}

@Schema({ _id: false })
class Calificacion {
    @Prop({ required: false, min: 1, max: 4 })
    efectividad: number;

    @Prop({ required: false, min: 1, max: 4 })
    satisfaccion: number;
}

@Schema()
export class Case {
    @Prop({ required: true, unique: true })
    numeroCaso: string;

    @Prop({ required: true })
    typeCaso: string;

    @Prop({ required: true })
    dependencia: string;

    @Prop({ required: true })
    funcionario: string;

    @Prop({ required: true })
    cargoFuncionario: string;

    @Prop({ type: Firma, required: true })
    firmaTecnico: Firma;

    @Prop({ type: Firma, required: false })
    firmaUsuario: Firma;

    @Prop({ type: Calificacion, required: false })
    calificacion: Calificacion;

    @Prop({ default: 'pendiente', enum: ['Abierto', 'En proceso', 'Cerrado', 'En escalamiento'] })
    estado: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    addData: any;

    @Prop({ default: Date.now })
    creadoEn: Date;
}

export const CaseSchema = SchemaFactory.createForClass(Case);

CaseSchema.index({ numeroCaso: 1 });
CaseSchema.index({ dependencia: 1 });
CaseSchema.index({ estado: 1 });
CaseSchema.index({ creadoEn: 1 });
