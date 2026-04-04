
import { and, ilike, or, sql, eq, desc, getTableColumns } from 'drizzle-orm';
import express from 'express';
import { classes, departments, subjects } from '../db/schema/app.js';
import { user } from '../db/schema/auth.js';
import { db } from '../db/db.js';

const router = express.Router();

// Get all classes with optional search filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // If search query exists, filter by class name OR invite code
        if (search) {
            filterConditions.push(
                or(
                    ilike(classes.name, `%${search}%`),
                    ilike(classes.inviteCode, `%${search}%`)
                )
            );
        }

        // If subject filter exists, match subject name
        if (subject) {
            filterConditions.push(ilike(subjects.name, `%${subject}%`));
        }

        // If teacher filter exists, match teacher name
        if (teacher) {
            filterConditions.push(ilike(user.name, `%${teacher}%`));
        }

        // Combine all filters using AND if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count) || 0;

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: { ...getTableColumns(subjects) },
                teacher: { ...getTableColumns(user) }
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause)
            .orderBy(desc(classes.created_at))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: classesList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });

    } catch (error) {
        console.log(`GET /classes error ${error}`);
        res.status(500).json({ error: 'failed to get classes' });
    }
});

// Get class details with teacher , subject , and department
router.get('/:id',async(req,res)=>{
    const classId = Number(req.params.id);

    if(!Number.isFinite(classId)) return res.status(400).json({error:'No Class found.'});

    const [classDetails] = await db.select({
        ...getTableColumns(classes),
        subject:{
            ...getTableColumns(subjects),
        },
        department:{
            ...getTableColumns(departments)
        },
        teacher:{
            ...getTableColumns(user)
        }
    })
    .from(classes)
    .leftJoin(subjects,eq(classes.subjectId,subjects.id))
    .leftJoin(user,eq(classes.teacherId,user.id))
    .leftJoin(departments,eq(subjects.departmentId,departments.id))
    .where(eq(classes.id,classId))

    if(!classDetails) return res.status(404).json({error:'No class found.'});

    return res.status(200).json({data:classDetails})
})

router.post('/',async(req,res)=>{
    try {
        const {name,teacherId,subjectId,capacity,description,status,bannerUrl,bannerCldPubId} = req.body;
        const [createdClass] = await db
        .insert(classes)
        .values({...req.body,inviteCode:Math.random().toString(36).substring(2,9),schedule:[]})
        .returning({id:classes.id})

        if(!createdClass) throw Error; 
         res.status(201).json({data:createdClass});
    } catch (error) {
        console.log(`Error in POST / ${error}`);
        res.status(500).json({error:error});
    }
})

export default router;