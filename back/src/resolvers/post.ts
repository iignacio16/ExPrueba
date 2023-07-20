import { RouterContext } from "oak/router.ts";
import { Evento } from "../types.ts";
import { EventoCollection } from "../db/mongo.ts";
import { EventoSchema } from "../db/schema.ts";

type addEventContext = RouterContext<
  "/addEvent",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

type Ibody = {
    titulo: string,
    descripcion?: string,
    fecha: string,
    inicio: number,
    fin: number,
    invitados: string[]
}

const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const fechaRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;

const validateFecha = (fecha: string) => {
  if (!fechaRegex.test(fecha)) {
    throw new Error("Formato fecha invalido");
  }
};

export const addEvent = async (context: addEventContext) => {
  try {
    const body = context.request.body({ type: "json" });
    const value: Ibody = await body.value;

    if (
      !value.titulo || !value.fecha || !value.inicio || !value.fin ||
      !value.invitados || !Array.isArray(value.invitados) // ![value.people]
    ) {
      context.response.status = 400;
      context.response.body = {
        message: "Missing params",
      };
      return;
    }
    
    validateFecha(value.fecha);
    const fechaNueva = value.fecha.split("-");
    const year = parseInt(fechaNueva[0]);
    const mes = parseInt(fechaNueva[1]);
    const dia = parseInt(fechaNueva[2]);
    
    const nuevaFecha = new Date(year, mes-1, dia+1)


    if (
      value.inicio < 0 || value.inicio > 22 || value.fin < 1 ||
      value.fin > 23 || value.inicio >= value.fin || !isValidDate(year, mes+1, dia)
    ) {
      context.response.status = 400;
      context.response.body = {
        message: "Invalid date or hour",
      };
      return;
    }

    const nuevoEvento: Evento= {
        titulo: value.titulo,
        descripcion: value.descripcion,
        fecha: nuevaFecha,
        inicio: value.inicio,
        fin: value.fin,
        invitados: value.invitados
    }
    const foundEvent = await EventoCollection.findOne({
        fecha: nuevaFecha,
        $or: [
            {inicio: {$gte: value.inicio, $lt: value.fin}},
            {fin: {$gt: value.inicio, $lte: value.fin}}
        ]
    })

    if(foundEvent){
        context.response.status = 400;
        context.response.body = {
            message: "Evento solapado"
        }
        return;
    }
    
        
    await EventoCollection.insertOne(nuevoEvento as EventoSchema)
    context.response.status = 200;
    context.response.body = nuevoEvento as EventoSchema;

  } catch (e) {
    context.response.status = 500;
    console.log(e);
  }
};
