import { NextResponse } from 'next/server';
import { seedSalesData } from '@/lib/seed-sales';

export async function POST() {
    try {
        seedSalesData();

        return NextResponse.json({
            success: true,
            message: 'Sales data seeded successfully!'
        });
    } catch (error: any) {
        console.error('Error seeding sales data:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
