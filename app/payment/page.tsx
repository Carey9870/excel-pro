"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { initiatePayment } from "@/app/actions";

export default async function PaymentPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const paymentUrl = await initiatePayment();
  redirect(paymentUrl);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Subscribe to Continue</h1>
      <p>Your trial has ended. Unlock your best content yet — subscribe for just $25/month to effortlessly optimize your writing, blogs, and ads. More clarity. More clicks. More results. Better Ranking.</p>
      <p>Redirecting to payment...</p>
    </div>
  );
}
