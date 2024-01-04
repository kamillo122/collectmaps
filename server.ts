import { WebSocketClient, WebSocketServer } from "https://deno.land/x/websocket@v0.1.3/mod.ts";
import {
    Bson,
    MongoClient,
  } from "https://deno.land/x/mongo@v0.29.2/mod.ts";

const port = parseInt(Deno.env.get('PORT') ?? '8000');
const wss = new WebSocketServer(port);

interface user {
    _id: Bson.ObjectId;
    id: number;
    name: string;
    neighbours: [number];
}

interface dataUser {
    id: number;
    name: string;
    neighbours: [number];
};

const client = new MongoClient();
await client.connect({
    db: "margo",
    tls: true,
    servers: [
        {
            host: "cluster0-shard-00-02.8from.mongodb.net",
            port: 27017,
        },
    ],
    credential: {
        username: "AdminKamilo",
        password: "I1udrg12",
        db: "margo",
        mechanism: "SCRAM-SHA-1",
    },
});
const db = client.database("margo");
const users = db.collection<user>("api");

wss.on("connection", (ws: WebSocketClient) => {
    ws.on("message", async (message: any) => {
        try {
            message = JSON.parse(message);
        }
        catch (err) {
            return;
        }
        const idFromUser:dataUser = {
            id: message.id,
            name: message.name,
            neighbours: message.neighbours,
        };
        console.log(idFromUser);
        const didExist = await users.findOne({id: idFromUser.id});
        if (!didExist) {
            const insertMap = await users.insertOne({
                id: message.id,
                name: message.name,
                neighbours: message.neighbours,
            });
        } else {
            return;
        }
    });
});
