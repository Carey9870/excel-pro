import { NextResponse } from "next/server";
import crypto from "crypto";

import db from "@/lib/db";
import { chargeAuthorization } from "@/lib/paystack";

// Define Paystack webhook event types
type PaystackEvent =
  | "charge.success"
  | "invoice.update"
  | "invoice.payment_failed"
  | "subscription.disable"
  | "subscription.create";

interface PaystackWebhookPayload {
  event: PaystackEvent;
  data: {
    customer: {
      email: string;
      customer_code: string;
    };
    authorization?: {
      authorization_code: string;
      channel: string;
    };
    reference?: string;
    amount?: number;
    status?: string;
    createdAt?: string;
    subscription?: {
      subscription_code: string;
      status: string;
      next_payment_date?: string;
    };
    invoice_code?: string;
    metadata?: { userId?: string };
  };
}

export async function POST(req: Request) {
  const secret = process.env.LIVE_SECRET_KEY!;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const body = (await req.json()) as PaystackWebhookPayload;
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    console.error("Missing Paystack signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");
  if (hash !== signature) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, data } = body;
  console.log("Webhook payload:", JSON.stringify(body, null, 2));

  const getUserId = async (data: PaystackWebhookPayload["data"]): Promise<string | null> => {
    const userId = data.metadata?.userId;
    if (userId) return userId;
    const email = data.customer?.email;
    if (email) {
      const profile = await db.profile.findFirst({ where: { email }, select: { userId: true } });
      return profile?.userId || null;
    }
    return null;
  };

  try {
    const profile = await db.profile.findFirst({
      where: { email: data.customer.email },
    });

    if (!profile) {
      console.warn(`Profile not found for email: ${data.customer.email}`);
      return NextResponse.json({}, { status: 200 });
    }

    switch (event) {
      case "subscription.create":
        {
          const userId = await getUserId(data);
          if (!userId) {
            console.error("No userId or email found in subscription.create:", data);
            return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
          }
          await db.profile.update({
            where: { userId },
            data: {
              subscription: "active",
              subscriptionStart: new Date(data.createdAt || Date.now()),
            },
          });
          console.log(`Subscription created for userId: ${userId}`);
        }
        break;

      case "charge.success":
        if (!profile.paystackCustomerId) {
          await db.profile.update({
            where: { id: profile.id },
            data: {
              paystackCustomerId: data.customer.customer_code,
              subscription: "active",
              subscriptionStart: new Date(),
            },
          });
          console.log(`Subscription activated for ${profile.email}`);
        } else if (data.authorization && profile.subscription === "active") {
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          await db.profile.update({
            where: { id: profile.id },
            data: {
              subscriptionStart: new Date(),
            },
          });
          console.log(`Recurring charge processed for ${profile.email}`);
        }
        break;

      case "invoice.update":
        if (data.status === "success" && profile.subscription === "active") {
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          await db.profile.update({
            where: { id: profile.id },
            data: {
              subscriptionStart: new Date(),
            },
          });
          console.log(`Invoice updated successfully for ${profile.email}`);
        }
        break;

      case "invoice.payment_failed":
        if (profile.subscription === "active" && data.authorization?.authorization_code) {
          console.warn(`Payment failed for ${profile.email}, invoice: ${data.invoice_code}`);
          try {
            await chargeAuthorization(data.authorization.authorization_code, profile.email);
            console.log(`Retry successful for ${profile.email}`);
          } catch (retryError) {
            console.error(`Retry failed for ${profile.email}:`, retryError);
          }
        }
        break;

      case "subscription.disable":
        if (profile.subscription === "active") {
          await db.profile.update({
            where: { id: profile.id },
            data: {
              subscription: "inactive",
            },
          });
          console.log(`Subscription deactivated for ${profile.email}`);
        }
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }
  } catch (error) {
    console.error(`Webhook processing error for event ${event}:`, error);
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.json({}, { status: 200 });
}