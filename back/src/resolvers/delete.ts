import { RouterContext } from "oak/router.ts";
import { EventoCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";

type deleteEventContext = RouterContext<
"/deleteEvent/:id",{
    id:string
} &
Record<string | number, string | undefined>,
Record<string, any> 
>;


export const deleteEvent = async (context: deleteEventContext)=> {
    try{
        const id = context.params.id

        const foundEvent = await EventoCollection.findOne({
            _id: new ObjectId(id)
        })
        if(!foundEvent){
            context.response.status = 404;
            context.response.body = {
                message: "Event not found"
            }
        }

        await EventoCollection.deleteOne({
            _id: new ObjectId(id)
        })
        context.response.status = 200;

    }catch(e){
        context.response.status = 500;
        console.log(e)
    }
}