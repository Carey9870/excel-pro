"use server"

import { initialProfile } from "@/lib/initial-profile";
import { getSubscriptionData } from "@/lib/subscribe";

export async function initiatePayment() {
  console.log("Initiating payment process...");
  try {
    const paymentUrl = await getSubscriptionData();
    console.log("Payment URL generated:", paymentUrl);
    return paymentUrl;
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error; // Re-throw to be caught by the client
  }
}

export async function getProfile() {
  return await initialProfile();
}
