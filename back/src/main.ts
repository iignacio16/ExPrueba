import {Application, Router} from "oak";
import { addEvent } from "./resolvers/post.ts";
import { getEventByID, getEvents } from "./resolvers/get.ts";
import { deleteEvent } from "./resolvers/delete.ts";
import { updateEvent } from "./resolvers/put.ts";


const router = new Router();

router
    .get("/test", (context) =>{
        context.response.body = "Funcionandoooo"
    })
    .post("/addEvent", addEvent)
    .get("/events", getEvents)
    .get("/event/:id", getEventByID)
    .delete("/deleteEvent/:id", deleteEvent)
    .put("/updateEvent", updateEvent)



const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.info("Server waiting for request on port 7777");
await app.listen({port: 7777});