import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import db from '@/lib/db';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId },
    select: { 
      id: true, 
      userId: true, 
      name: true, 
      imageUrl: true, 
      email: true, 
      paystackCustomerId: true, 
      trialUses: true, 
      subscription: true, 
      subscriptionStart: true, 
      createdAt: true, 
      updatedAt: true 
    },
  });

  if (!profile) {
    return new NextResponse('Profile not found', { status: 404 });
  }

  return NextResponse.json(profile);
}