import { RouterContext } from "oak/router.ts";
import { EventoSchema } from "../db/schema.ts";
import { EventoCollection } from "../db/mongo.ts";
import { ObjectId } from "mongo";

type getEventsContext = RouterContext<
  "/events",
  Record<string | number, string | undefined>,
  Record<string, any>
>;
type getEventByIDContext = RouterContext<
"/event/:id",{
    id:string
} &
Record<string | number, string | undefined>,
Record<string, any> 
>;

export const getEvents = async (context: getEventsContext)=>{
    try{

        const today = new Date(new Date().setHours(0,0,0,0));

        const events: EventoSchema[] = await EventoCollection.find({
            fecha: {$gte: today}
        }).sort({fecha: 1, inicio: 1}).toArray()

        context.response.status = 200;
        context.response.body= {events}

    }catch(e){
        context.response.status=500;
        console.log(e)
    }
}

export const getEventByID = async (context: getEventByIDContext)=> {
    try{
        const id = context.params.id;

        const event = await EventoCollection.findOne({
            _id: new ObjectId(id)
        });
        if(!event){
            context.response.status = 404;
            context.response.body = {
                message: "Event not found"
            }
            return;
        }

        context.response.status=200;
        context.response.body = event;

    }catch(e){
        context.response.status = 500;
        console.log(e)
    }
}