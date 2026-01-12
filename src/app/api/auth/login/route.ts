
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

        let user;
        if (username === 'admin@example.com' || username === 'admin') {
            user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get('admin', password);
        } else {
            // Check if there is an email column in users table?
            // Looking at db.ts: CREATE TABLE IF NOT EXISTS users (id, username, password, role...)
            // It does NOT have an email column!
            // We should probably rely on 'username' for now, or assume the input is username.
            // But the UI says "Email".
            // Quick fix: Allow login with username "admin" even if UI says Email.
            user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Success
        const { password: _, ...userWithoutPassword } = user as any;
        return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
