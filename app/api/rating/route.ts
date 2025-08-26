import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { z } from 'zod';

const ratingSchema = z.object({
  queryId: z.string().uuid(),
  rating: z.number().min(0).max(5),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { queryId, rating } = ratingSchema.parse(body);

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 });
    }

    const query = await db.query.findUnique({ where: { id: queryId } });
    if (!query || query.profileId !== profile.id) {
      return new NextResponse('Query not found or unauthorized', { status: 404 });
    }

    await db.query.update({
      where: { id: queryId },
      data: { rating },
    });

    return NextResponse.json({ success: true, rating }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error('Error updating rating:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}