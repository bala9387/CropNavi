
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // In a real app, you would hash the password and compare hashes.
        // For this simple demo (per db.ts), admin/admin123 is stored as plain text or simple check.
        // We'll check username/email against the username column for 'admin' or email column for others if added.
        // Changes: db.ts has 'username' but login page asks for 'email'.
        // We will assume username = email for simplicity or check both.

        // For admin, db init sets username='admin'.
        // Let's support "admin" or "admin@example.com" logging in as admin.

        // Check if user exists
        let user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user) {
            // User not found? Auto-create them for seamless prototype experience!
            try {
                const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, password, 'user');
                user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
            } catch (e) {
                console.error("Auto-signup failed", e);
                return NextResponse.json({ error: 'Internal server error during auto-signup' }, { status: 500 });
            }
        } else {
            // User exists, check password
            if (user.password !== password) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
        }

        if (!user) {
            // Should not happen if auto-create worked
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        // Success
        const { password: _, ...userWithoutPassword } = user as any;
        return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
