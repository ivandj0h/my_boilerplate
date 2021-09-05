import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

import _ from "../helpers/utils";
import { isAuthenticated } from "../middlewares/isAuthenticates";


export const auth = Router();
const prisma = new PrismaClient()

auth.post("/login", async (req: Request, res: Response): Promise<any> => {
    const {
        email,
        password
    } = req.body
    const checkUserExist = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!checkUserExist) return res.status(400).json({
        status: "Error!",
        message: "Sorry, User not found!"
    });
    try {
        if(await argon2.verify(checkUserExist.password, password)) {
            const username = email.substring(0, email.indexOf("@"))
            const accessToken = jwt.sign({
                userId: checkUserExist.id
            }, _.generateString(5));
            res.status(200).json({
                status: 200,
                success: true,
                message: `Hello, ${username} Welcome Aboard, you're successfully login!`,
                token: accessToken
            })
        } else {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid Password!"
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error!"
        })
    }
})
auth.post("/register", async (req: Request, res: Response): Promise<any> => {
    const {
        email,
        password
    } = req.body

    const username = email.substring(0, email.indexOf("@"))
    const result = await prisma.user.findUnique({
        where: {
            username: username
        }
    })

    if (result) return res.status(400).json({
        status: "Error!",
        message: "Sorry, User already exist!"
    });

    const hashPassword = await argon2.hash(password);

    const user = await prisma.user.create({
        data: {
            username: username,
            password: hashPassword,
            email: email
        }
    })

    const accessToken = jwt.sign({
        userId: user.id
    }, _.generateString(5));

    res.status(200).json({
        status: 200,
        success: true,
        message: `Congradulation, User ${username} has been created!`,
        token: accessToken
    })
})


// example
auth.get("/protected", isAuthenticated,  (req: Request, res: Response): any  => {
    res
    .status(200)
    .json({
        status: 200,
        success: true,
        message: `Congradulation, you're in Protected area now!`     
    })
})