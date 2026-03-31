import { Schedule } from './../../../classroom-frontend/src/types/index';
import express from 'express'
import { db } from '../db/db.js';
import { classes } from '../db/schema.js';

const router = express.Router();

router.post('/',async(req,res)=>{
    try {
        const {name,teacherId,subjectId,capacity,description,status,bannerUrl,bannerCldPubId} = req.body;
        const [createdClass] = await db
        .insert(classes)
        .values({...req.body,inviteCode:Math.random().toString(36).substring(2,9),schedule:[]})
    } catch (error) {
        console.log(`Error in POST / ${error}`);
        res.status(500).json({error:error});
    }
})