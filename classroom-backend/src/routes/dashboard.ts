import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { departments, subjects, classes, enrollments } from '../db/schema/app.js';
import { user } from '../db/schema/auth.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(user);
        const [departmentCount] = await db.select({ count: sql<number>`count(*)` }).from(departments);
        const [subjectCount] = await db.select({ count: sql<number>`count(*)` }).from(subjects);
        const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(classes);
        const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);

        // Chart 1: Enrollment Trends (group by month created_at)
        const enrollmentTrends = await db.execute(sql`
            SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as count 
            FROM enrollments 
            GROUP BY TO_CHAR(created_at, 'Mon YYYY') 
            ORDER BY MIN(created_at) ASC 
            LIMIT 6
        `);

        // Chart 2: Classes by Department
        const classesByDept = await db.execute(sql`
            SELECT d.name as department, COUNT(c.id) as class_count
            FROM departments d
            LEFT JOIN subjects s ON d.id = s.department_id
            LEFT JOIN classes c ON s.id = c.subject_id
            GROUP BY d.id, d.name
        `);

        // Chart 3: User Distribution (Role)
        const userDistribution = await db.execute(sql`
            SELECT role, COUNT(*) as count
            FROM "user"
            GROUP BY role
        `);

        res.status(200).json({
            data: {
                overview: {
                    totalUsers: Number(userCount?.count) || 0,
                    totalDepartments: Number(departmentCount?.count) || 0,
                    totalSubjects: Number(subjectCount?.count) || 0,
                    totalClasses: Number(classCount?.count) || 0,
                    totalEnrollments: Number(enrollmentCount?.count) || 0
                },
                charts: {
                    enrollmentTrends: enrollmentTrends.rows,
                    classesByDept: classesByDept.rows,
                    userDistribution: userDistribution.rows
                }
            }
        });
    } catch (error) {
        console.error('GET /dashboard/stats error', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
