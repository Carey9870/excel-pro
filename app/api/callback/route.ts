import { NextResponse } from 'next/server';

import { verifyTransaction } from '@/lib/paystack';
import db from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    console.log("No reference provided, redirecting to home");
    return NextResponse.redirect("https://excel-pro-nine.vercel.app/");
  }

  try {
    const transaction = await verifyTransaction(reference);
    if (transaction.status !== "success") {
      console.log(`Transaction ${reference} not successful: ${transaction.status}`);
      return NextResponse.redirect("https://excel-pro-nine.vercel.app/");
    }

    const profile = await db.profile.findFirst({
      where: { email: transaction.customer.email },
    });

    if (profile) {
      await db.profile.update({
        where: { id: profile.id },
        data: {
          paystackCustomerId: transaction.customer.customer_code,
          subscription: "active",
          subscriptionStart: new Date(),
        },
      });
      console.log(`Profile updated for email: ${transaction.customer.email}`);
    } else {
      console.warn(`No profile found for email: ${transaction.customer.email}`);
    }
    return NextResponse.redirect("https://excel-pro-nine.vercel.app/dashboard");
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect("https://excel-pro-nine.vercel.app/");
  }
}
