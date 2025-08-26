import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import db from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";

export async function getSubscriptionData() {
  console.log("Starting getSubscriptionData...");
  const user = await currentUser();
  if (!user) {
    console.log("No Clerk user found, redirecting to sign-in");
    redirect("/sign-in");
  }

  console.log("Fetching existing profile for user:", user.id);
  let paystackCustomerId = (
    await db.profile.findUnique({
      where: { userId: user.id },
      select: { paystackCustomerId: true },
    })
  )?.paystackCustomerId;

  if (!paystackCustomerId) {
    paystackCustomerId = `cust_${user.id}`;
    console.log("Creating new profile with Paystack customer ID:", paystackCustomerId);
    try {
      await db.profile.upsert({
        where: { userId: user.id },
        update: { paystackCustomerId },
        create: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
          paystackCustomerId,
          trialUses: 0,
          subscription: "inactive",
        },
      });
      console.log("Profile upsert successful");
    } catch (dbError) {
      console.error("Database upsert error:", dbError);
      throw dbError;
    }
  }
					
  const planCode = "PLN_vvsfbkuq1ivo8cl";
  console.log("Initializing Paystack transaction with plan:", planCode);
  try {
    const paystackResponse = await initializeTransaction(
      user.id,
      user.emailAddresses[0].emailAddress,
      planCode
    );
    console.log("Paystack response received:", paystackResponse);
    if (!paystackResponse.data?.authorization_url) {
      throw new Error("Invalid Paystack response: missing authorization_url");
    }
    return paystackResponse.data.authorization_url;
  } catch (paystackError) {
    console.error("Paystack transaction error:", paystackError);
    throw paystackError;
  }
}






//-


// import { currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// import db from "@/lib/db";
// import { initializeTransaction } from "@/lib/paystack";

// export async function getSubscriptionData() {
	// console.log("Fetching current user...");
  // const user = await currentUser();
  // if (!user) {
    // console.log("No Clerk user found, redirecting to sign-in");
    // redirect("/sign-in");
  // }

  // console.log("Checking or creating Paystack customer ID for user:", user.id);
  // let paystackCustomerId = (
    // await db.profile.findUnique({
      // where: { userId: user.id },
      // select: { paystackCustomerId: true },
    // })
  // )?.paystackCustomerId;

  // if (!paystackCustomerId) {
    // paystackCustomerId = `cust_${user.id}`;
	// console.log("Creating new profile with Paystack customer ID:", paystackCustomerId);
    // await db.profile.upsert({
      // where: { userId: user.id },
      // update: { paystackCustomerId },
      // create: {
        // userId: user.id,
        // name: `${user.firstName} ${user.lastName}`,
        // imageUrl: user.imageUrl,
        // email: user.emailAddresses[0].emailAddress,
        // paystackCustomerId,
        // trialUses: 0,
        // subscription: "inactive",
      // },
    // });
  // }

  // const planCode = "PLN_vvsfbkuq1ivo8cl";
  // console.log("Initializing Paystack transaction with plan:", planCode);
  // const paystackResponse = await initializeTransaction(
    // user.id,
    // user.emailAddresses[0].emailAddress,
    // planCode
  // );
  
  // console.log("Paystack response:", paystackResponse);
  // return paystackResponse.data.authorization_url;
// }