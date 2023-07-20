import { ObjectId } from "mongo";
import { Evento } from "../types.ts";

export type EventoSchema = Evento & {
    _id: ObjectId
}