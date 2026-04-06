import { and, ilike, or, sql, eq, desc, getTableColumns } from 'drizzle-orm';
import express from 'express';
import { user } from '../db/schema/index.js';
import { db } from '../db/db.js';

const router = express.Router();

// Get all users with optional search filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // If search query exists, filter by user name OR email
        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )
            );
        }

        // If role filter exists, match exact role
        if (role) {
            filterConditions.push(eq(user.role, String(role) as "student" | "teacher" | "admin"));
        }

        //combine all filters using AND if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const usersList = await db
            .select({
                ...getTableColumns(user)
            })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });

    } catch (error) {
        console.log(`GET /users error ${error}`);
        res.status(500).json({ error: 'failed to get users' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [userDetails] = await db
            .select()
            .from(user)
            .where(eq(user.id, id));

        if (!userDetails) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ data: userDetails });
    } catch (error) {
        console.log(`GET /users/:id error`, error);
        res.status(500).json({ error: 'failed to get user' });
    }
});

// Create user
router.post('/', async (req, res) => {
    try {
        const { name, email, role, image } = req.body;
        
        // Basic check
        const [existing] = await db.select().from(user).where(eq(user.email, email));
        if (existing) {
             return res.status(400).json({ error: 'User with this email already exists' });
        }

        const id = Math.random().toString(36).substring(2, 15); // generated ID

        const [createdUser] = await db
            .insert(user)
            .values({ id, name, email, role: role || 'student', emailVerified: true, image })
            .returning();

        res.status(201).json({ data: createdUser });
    } catch (error) {
        console.log(`POST /users error`, error);
        res.status(500).json({ error: 'failed to create user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, image, emailVerified } = req.body;

        if (email) {
            const [existing] = await db.select().from(user).where(and(eq(user.email, email), sql`id != ${id}`));
            if (existing) {
                 return res.status(400).json({ error: 'User with this email already exists' });
            }
        }

        const [updatedUser] = await db
            .update(user)
            .set({ name, email, role, image, emailVerified, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ data: updatedUser });
    } catch (error) {
        console.log(`PUT /users error`, error);
        res.status(500).json({ error: 'failed to update user' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
        
        if (!deleted) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ data: deleted });
    } catch (error) {
        console.log(`DELETE /users error`, error);
        res.status(500).json({ error: 'failed to delete user' });
    }
});

export default router;
