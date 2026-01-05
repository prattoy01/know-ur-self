import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { updateRating } from '@/lib/rating';

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await updateRating(session.userId);
        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
    }
}
