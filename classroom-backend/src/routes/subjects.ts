
import { and, ilike, or, sql, eq, desc, getTableColumns } from 'drizzle-orm';
import express from 'express'
import { departments, subjects } from '../db/schema/app.js';
import { db } from '../db/db.js';

const router = express.Router();

// Get all subjects with optional search filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // If search query exists , filter by subjects name OR subject code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        //check

        // If department filter exists , match department name
        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`));
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name, deptPattern));
        }

        //combine all filters using AND if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number> `count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.created_at))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })

    } catch (error) {
        console.log(`GET /subjects error ${error}`);
        res.status(500).json({ error: 'failed to get subjects' });
    }
})

// Get subject by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid subject ID' });

        const [subject] = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, id));

        if (!subject) return res.status(404).json({ error: 'Subject not found' });

        res.status(200).json({ data: subject });
    } catch (error) {
        console.log(`GET /subjects/:id error`, error);
        res.status(500).json({ error: 'failed to get subject' });
    }
});

// Create subject
router.post('/', async (req, res) => {
    try {
        const { name, code, description, departmentId } = req.body;
        
        const [existing] = await db.select().from(subjects).where(eq(subjects.code, code));
        if (existing) {
             return res.status(400).json({ error: 'Subject with this code already exists' });
        }

        const [createdSubject] = await db
            .insert(subjects)
            .values({ name, code, description, departmentId })
            .returning();

        res.status(201).json({ data: createdSubject });
    } catch (error) {
        console.log(`POST /subjects error`, error);
        res.status(500).json({ error: 'failed to create subject' });
    }
});

// Update subject
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid subject ID' });

        const { name, code, description, departmentId } = req.body;
        
        if (code) {
            const [existing] = await db.select().from(subjects).where(and(eq(subjects.code, code), sql`id != ${id}`));
            if (existing) {
                 return res.status(400).json({ error: 'Subject with this code already exists' });
            }
        }

        const [updatedSubject] = await db
            .update(subjects)
            .set({ name, code, description, departmentId, updated_at: new Date() })
            .where(eq(subjects.id, id))
            .returning();

        if (!updatedSubject) return res.status(404).json({ error: 'Subject not found' });

        res.status(200).json({ data: updatedSubject });
    } catch (error) {
        console.log(`PUT /subjects error`, error);
        res.status(500).json({ error: 'failed to update subject' });
    }
});

// Delete subject
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid subject ID' });

        // We can't delete a subject if classes exist for it (restrict foreign key assumed, but schema says cascade for classes->subject? Wait, schema: classes: subjectId: references(() => subjects.id, { onDelete: 'cascade' })
        // If it cascades, it deletes the classes automatically. But maybe we should warn or block. Let's just delete for now and let the cascade handle it.

        const [deleted] = await db.delete(subjects).where(eq(subjects.id, id)).returning();
        
        if (!deleted) return res.status(404).json({ error: 'Subject not found' });

        res.status(200).json({ data: deleted });
    } catch (error) {
        console.log(`DELETE /subjects error`, error);
        res.status(500).json({ error: 'failed to delete subject' });
    }
});

export default router;