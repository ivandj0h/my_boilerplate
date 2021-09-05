import express from "express";
import { PrismaClient } from ".prisma/client";
import consola, { Consola } from "consola";
import cors from "cors";
import { auth as AuthRoute } from "./routes/Auth";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";

export class Server {
    public app: express.Application;
    public logger: Consola = consola;
    private prisma: PrismaClient = new PrismaClient()

    public constructor() {
        this.app = express();
    }

    public start() {
        this.setConfig();
        this.setRequestLogger();
        this.setRoutes();

        this.app.listen(process.env.SERVER_PORT, () => {
            this.logger.success(`Server now Running on http://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`)
        })
    }

    private setConfig() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cors());

        dotenv.config();
    }

    private setRequestLogger() {
        this.app.use(async (req, res, next) => {
            console.log(`${req.method} - ${req.path}`);

            next();
        })
    }

    private setRoutes() {
        this.app.get("/", (req, res) => {
            res.status(200).json({
                title: "EMS Project",
                message: "You're now connected!"
            })
        })

        this.app.use("/api/v1/auth", AuthRoute)
    }

}
