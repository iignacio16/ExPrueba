import { RouterContext } from "oak/router.ts";
import { EventoCollection } from "../db/mongo.ts";
import { ObjectId } from "mongo";
import { EventoSchema } from "../db/schema.ts";

type updateEventContext = RouterContext<
  "/updateEvent",
  Record<string | number, string | undefined>,
  Record<string, any>
>;
type Ibody = {
    id:string,
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

export const updateEvent = async (context: updateEventContext) => {
    try{
        const body = context.request.body({type: "json"})
        const value: Ibody = await body.value

        const {id, titulo, descripcion, fecha, inicio, fin, invitados} = value;
        validateFecha(fecha);
        const fechaNueva = fecha.split("-");
        const year = parseInt(fechaNueva[0]);
        const mes = parseInt(fechaNueva[1]);
        const dia = parseInt(fechaNueva[2]);
        if (
            !titulo || !fecha || !inicio || !fin ||
            !invitados || !Array.isArray(invitados) || !isValidDate(year, mes-1, dia)
            || (inicio >= fin)
          ) {
            context.response.status = 400;
            context.response.body = {
              message: "Missing or bad params",
            };
            return;
          }

          
        const nuevaFecha = new Date(year, mes-1, dia+1)
      
        const event = await EventoCollection.findOne({
            _id: new ObjectId(id)
        })

        if(!event){
            context.response.status = 404;
            context.response.body = {
                message: "Event not found"
            }
            return;
        }

        const solapado = await EventoCollection.findOne({
            fecha: nuevaFecha,
            $or: [
                {inicio: {$gte: inicio, $lt: fin}},
                {fin: {$gt: inicio, $lte: fin}}
            ]
        });

        if(solapado){
            context.response.status = 400
            context.response.body = {
                message: "Evento solapado"
            }
            return;
        }

        const updateEvent = await EventoCollection.updateOne({
            _id: new ObjectId(id)
        },
        {
            $set: {
                titulo,
                descripcion,
                fecha: nuevaFecha,
                inicio,
                fin,
                invitados
            }
        })

        if(updateEvent.matchedCount === 0){
            context.response.status = 404;
            context.response.body = {
                message: "Not updated"
            }
            return;
        }

        const actualizado = await EventoCollection.findOne({_id: new ObjectId(id)})

        context.response.status = 200;
        context.response.body= actualizado as EventoSchema;
    }catch(e){
        context.response.status = 500;
        console.log(e)
    }
}