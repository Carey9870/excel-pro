import axios from 'axios';

const LIVE_SECRET_KEY = process.env.LIVE_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!LIVE_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is not defined in the environment variables");
  throw new Error("PAYSTACK_SECRET_KEY is not defined");
}

export async function initializeTransaction(userId: string, email: string, planCode: string) {
  const maxRetries = 5;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Initializing Paystack subscription with:`, { email, planCode, userId });

      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LIVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: 130000, // 10 * 130 * 100 kobo
          plan: planCode,
          currency: "KES",
          callback_url: process.env.LIVE_CALLBACK_KEY,
          metadata: { userId },
          custom_fields: [
            {
              display_name: "Equivalent Amount",
              variable_name: "equivalent_amount",
              value: "USD 10 (KES 1300 at ~130 KES/USD)",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Paystack API error (Attempt ${attempt}):`, errorData);
        throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (!data.status || !data.data?.authorization_url) {
        console.error("Invalid Paystack response:", data);
        throw new Error("Invalid Paystack response: missing authorization_url");
      }

      console.log(`Paystack subscription initialized successfully on attempt ${attempt}:`, data);
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

export async function verifyTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${LIVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data.status || data.data.status !== "success") {
    console.error("Transaction verification failed:", data);
    throw new Error("Transaction verification failed: " + JSON.stringify(data));
  }

  return data.data;
}

export async function chargeAuthorization(authorizationCode: string, email: string) {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
    {
      authorization_code: authorizationCode,
      email,
      amount: 130000,
    },
    { headers: { Authorization: `Bearer ${LIVE_SECRET_KEY}`, 'Content-Type': 'application/json' } }
  );
  return response.data.data;
}


//-----------------------------------------

// import axios from 'axios';

// const LIVE_SECRET_KEY = process.env.LIVE_SECRET_KEY!;
// const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// if (!LIVE_SECRET_KEY) {
  // throw new Error("PAYSTACK_SECRET_KEY is not defined in the environment variables");
// }

// export async function initializeTransaction(userId: string, email: string, planCode: string) {
  // const maxRetries = 5;
  // const retryDelay = 1000;

  // for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // try {
      // console.log(`Attempt ${attempt}: Initializing Paystack subscription with:`, { email, planCode, userId });

      // const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        // method: "POST",
        // headers: {
          // Authorization: `Bearer ${LIVE_SECRET_KEY}`,
          // "Content-Type": "application/json",
        // },
        // body: JSON.stringify({
          // email,
          // amount: 130000, // 10 * 130 * 100 kobo
          // plan: planCode,
          // currency: "KES",
          // callback_url: process.env.LIVE_CALLBACK_KEY,
          // metadata: { userId },
          // custom_fields: [
            // {
              // display_name: "Equivalent Amount",
              // variable_name: "equivalent_amount",
              // value: "USD 10 (KES 1300 at ~130 KES/USD)",
            // },
          // ],
        // }),
      // });

      // if (!response.ok) {
        // const errorData = await response.json();
        // console.log(errorData);
        // throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(errorData)}`);
      // }

      // const data = await response.json();
      // if (!data.status || !data.data?.authorization_url) {
        // throw new Error("Invalid Paystack response: missing authorization_url");
      // }

      // console.log(`Paystack subscription initialized successfully on attempt ${attempt}:`, data);
      // return data;
    // } catch (error) {
      // console.error(`Attempt ${attempt} failed:`, error);
      // if (attempt === maxRetries) {
        // throw error;
      // }
      // await new Promise((resolve) => setTimeout(resolve, retryDelay));
    // }
  // }
// }

// export async function verifyTransaction(reference: string) {
  // const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    // method: "GET",
    // headers: {
      // Authorization: `Bearer ${LIVE_SECRET_KEY}`,
      // "Content-Type": "application/json",
    // },
  // });

  // const data = await response.json();
  // if (!response.ok || !data.status || data.data.status !== "success") {
    // throw new Error("Transaction verification failed: " + JSON.stringify(data));
  // }

  // return data.data;
// }

// export async function chargeAuthorization(authorizationCode: string, email: string) {
  // const response = await axios.post(
    // `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
    // {
      // authorization_code: authorizationCode,
      // email,
      // amount: 130000,
    // },
    // { headers: { Authorization: `Bearer ${LIVE_SECRET_KEY}`, 'Content-Type': 'application/json' } }
  // );
  // return response.data.data;
// }