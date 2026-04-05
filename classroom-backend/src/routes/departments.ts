import { and, ilike, or, sql, eq, desc, getTableColumns } from 'drizzle-orm';
import express from 'express';
import { departments, subjects } from '../db/schema/app.js';
import { db } from '../db/db.js';

const router = express.Router();

// Get all departments with optional search filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(departments.name, `%${search}%`),
                    ilike(departments.code, `%${search}%`)
                )
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(departments)
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count) || 0;

        const departmentsList = await db
            .select()
            .from(departments)
            .where(whereClause)
            .orderBy(desc(departments.created_at))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: departmentsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });

    } catch (error) {
        console.log(`GET /departments error`, error);
        res.status(500).json({ error: 'failed to get departments' });
    }
});

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid department ID' });

        const [department] = await db
            .select()
            .from(departments)
            .where(eq(departments.id, id));

        if (!department) return res.status(404).json({ error: 'Department not found' });
        
        // Count subjects for this department
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(subjects).where(eq(subjects.departmentId, id));
        const subjectsCount = Number(countResult[0]?.count) || 0;

        res.status(200).json({ data: { ...department, _count: { subjects: subjectsCount } } });
    } catch (error) {
        console.log(`GET /departments/:id error`, error);
        res.status(500).json({ error: 'failed to get department' });
    }
});

// Create department
router.post('/', async (req, res) => {
    try {
        const { name, code, description } = req.body;
        
        // Check uniqueness of code
        const [existing] = await db.select().from(departments).where(eq(departments.code, code));
        if (existing) {
             return res.status(400).json({ error: 'Department with this code already exists' });
        }

        const [createdDepartment] = await db
            .insert(departments)
            .values({ name, code, description })
            .returning();

        res.status(201).json({ data: createdDepartment });
    } catch (error) {
        console.log(`POST /departments error`, error);
        res.status(500).json({ error: 'failed to create department' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid department ID' });

        const { name, code, description } = req.body;
        
        if (code) {
            // Check uniqueness of code
            const [existing] = await db.select().from(departments).where(and(eq(departments.code, code), sql`id != ${id}`));
            if (existing) {
                 return res.status(400).json({ error: 'Department with this code already exists' });
            }
        }

        const [updatedDepartment] = await db
            .update(departments)
            .set({ name, code, description })
            .where(eq(departments.id, id))
            .returning();

        if (!updatedDepartment) return res.status(404).json({ error: 'Department not found' });

        res.status(200).json({ data: updatedDepartment });
    } catch (error) {
        console.log(`PUT /departments error`, error);
        res.status(500).json({ error: 'failed to update department' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid department ID' });

        // Check if there are subjects under this department
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(subjects).where(eq(subjects.departmentId, id));
        if ((Number(countResult[0]?.count) || 0) > 0) {
            return res.status(400).json({ error: 'Cannot delete department with existing subjects. Remove subjects first.' });
        }

        const [deleted] = await db.delete(departments).where(eq(departments.id, id)).returning();
        
        if (!deleted) return res.status(404).json({ error: 'Department not found' });

        res.status(200).json({ data: deleted });
    } catch (error) {
        console.log(`DELETE /departments error`, error);
        res.status(500).json({ error: 'failed to delete department' });
    }
});

export default router;
