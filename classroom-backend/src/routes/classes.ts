
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

// Update class
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });

        const { name, teacherId, subjectId, capacity, description, status, bannerUrl, bannerCldPubId } = req.body;

        const [updatedClass] = await db
            .update(classes)
            .set({ name, teacherId, subjectId, capacity, description, status, bannerUrl, bannerCldPubId, updated_at: new Date() })
            .where(eq(classes.id, id))
            .returning();

        if (!updatedClass) return res.status(404).json({ error: 'Class not found' });

        res.status(200).json({ data: updatedClass });
    } catch (error) {
        console.log(`PUT /classes error`, error);
        res.status(500).json({ error: 'failed to update class' });
    }
});

// Delete class
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });

        const [deleted] = await db.delete(classes).where(eq(classes.id, id)).returning();
        
        if (!deleted) return res.status(404).json({ error: 'Class not found' });

        res.status(200).json({ data: deleted });
    } catch (error) {
        console.log(`DELETE /classes error`, error);
        res.status(500).json({ error: 'failed to delete class' });
    }
});

// ENROLLMENTS
import { enrollments } from '../db/schema/app.js';

// Get enrollments for a class
router.get('/:id/enroll', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });

        const enrollmentsList = await db
            .select({
                ...getTableColumns(enrollments),
                student: { ...getTableColumns(user) }
            })
            .from(enrollments)
            .leftJoin(user, eq(enrollments.studentId, user.id))
            .where(eq(enrollments.classId, id));

        res.status(200).json({ data: enrollmentsList });
    } catch (error) {
        console.log(`GET /classes/:id/enroll error:`, error);
        res.status(500).json({ error: 'failed to get enrollments' });
    }
});

// Enroll a student
router.post('/:id/enroll', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });

        const { studentId } = req.body;
        if (!studentId) return res.status(400).json({ error: 'studentId is required' });

        // Check capacity
        const [cls] = await db.select().from(classes).where(eq(classes.id, id));
        if (!cls) return res.status(404).json({ error: 'Class not found' });

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(enrollments).where(eq(enrollments.classId, id));
        const currentCount = Number(countResult[0]?.count) || 0;

        if (currentCount >= cls.capacity) {
             return res.status(400).json({ error: 'Class capacity reached' });
        }

        // Check if already enrolled
        const [existing] = await db.select().from(enrollments).where(and(eq(enrollments.classId, id), eq(enrollments.studentId, studentId)));
        if (existing) {
             return res.status(400).json({ error: 'Student already enrolled' });
        }

        const [enrollment] = await db.insert(enrollments).values({ classId: id, studentId }).returning();

        res.status(201).json({ data: enrollment });
    } catch (error) {
        console.log(`POST /classes/:id/enroll error:`, error);
        res.status(500).json({ error: 'failed to enroll student' });
    }
});

// Unenroll a student
router.delete('/:id/enroll/:studentId', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { studentId } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });

        const [deleted] = await db
            .delete(enrollments)
            .where(and(eq(enrollments.classId, id), eq(enrollments.studentId, studentId)))
            .returning();
        
        if (!deleted) return res.status(404).json({ error: 'Enrollment not found' });

        res.status(200).json({ data: deleted });
    } catch (error) {
        console.log(`DELETE /classes/:id/enroll error:`, error);
        res.status(500).json({ error: 'failed to unenroll student' });
    }
});

export default router;