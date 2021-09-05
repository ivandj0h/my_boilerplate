import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import _ from "../helpers/utils";

const prisma = new PrismaClient();

export const isAuthenticated = async (
    req: Request, 
    res: Response, 
    next: NextFunction
    ): Promise<any> => {
    if (!req.headers["authorization"]) {
        return res
        .status(400)
        .json({
            status: 400,
            success: false,
            message: "Sorry, you're Unauthorized!"
        })
    }

    const authHeader: string = req.headers["authorization"]
    const authMethod: string = authHeader.split(" ")[0]
    const accessToken: string = authHeader.split(" ")[1]

    if(!authMethod || !accessToken) {
        return res
        .status(400)
        .json({
            status: 400,
            success: false,
            message: "Sorry, Invalid Auth Header!"
        })        
    } else if(authMethod !== "Bearer") {
        return res
        .status(400)
        .json({
            status: 400,
            success: false,
            message: "Sorry, Invalid Auth Method!"
        })         
    }

    let tokenBody: any

    try {
        tokenBody = jwt.verify(accessToken, _.generateString(5))

    } catch (err) {
        return res
        .status(400)
        .json({
            status: 400,
            success: false,
            message: "Sorry, Invalid Token!"
        })
    }
        if(!tokenBody.userId) {
            return res
            .status(400)
            .json({
                status: 400,
                success: false,
                message: "Sorry, Invalid Token!"
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            id: tokenBody.userId
        }
    })

    if(!user) {
        return res
        .status(400)
        .json({
            status: 400,
            success: false,
            message: "Sorry, User doesn't Exist!"
    })
    }

    // asign to typings
    req.User = user;
    next()
}