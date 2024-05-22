import { Request, Response } from "express";

export async function doHealthCheck(req: Request, res: Response) {
    /* let data = req.store as Storage;
    let dbConnected = await data.isConnected();

    if (!dbConnected)
        return res.status(500).send(`Not able to connect to <strong>MONGODB</strong> database on <strong>${MONGO_HOST}</strong>.`);

    res.send(`Connection to database on '<strong>${MONGO_HOST}</strong>' is connected and functioning.`); */
}
