import { db } from './../db/db.js';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema/auth.js"

 // your drizzle instance

export const auth = betterAuth({
    secret:process.env.BETTER_AUTH_SECRET!,
    trustedOrigins:[process.env.FRONTEND_URL!],
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema:schema
    }),
    emailAndPassword:{
        enabled:true,
    },
    user:{
        additionalFields:{
            role:{
                type:'string',required:true,defaultValue:'student',input:true
            },
            imageCldPubId:{
                type:'string',required:false,input:true,
            }
        }
    }
});