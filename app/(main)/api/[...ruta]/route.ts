// API de Insta Face (registro, acceso rápido y resultado). La lógica y las claves viven en server/ (solo servidor).
import { after } from "next/server";
import { responder } from "@/server/handler";

export const dynamic = "force-dynamic";

const atender = (req: Request) => responder(req, { despues: (tarea) => after(() => tarea) });

export { atender as GET, atender as POST };
