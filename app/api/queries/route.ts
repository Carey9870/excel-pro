import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { currentProfile } from '@/lib/current-profile';
import db from '@/lib/db'; 

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 });
    }

    // Corrected logic: Fetch queries associated with the current profile
    const queries = await db.query.findMany({
      where: {
        profileId: profile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Fetch the last 10 queries, or adjust as needed
    });

    // Return the array of queries
    return NextResponse.json(queries);
  } catch (error: any) {
    console.error('Error fetching queries:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}