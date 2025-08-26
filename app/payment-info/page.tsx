"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { initiatePayment } from "@/app/actions";

function useCountdown(checkoutUrl: string | null, isMounted: boolean) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isMounted || !checkoutUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          clearInterval(timer);
          window.location.href = checkoutUrl;
          return 0;
        }
        toast.info(
          `You will be redirected to pay USD 10 in ${newCount} seconds`,
          {
            id: "payment-toast",
            duration: 1000 * (newCount + 1),
          }
        );
        return newCount;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, checkoutUrl]);

  return countdown;
}

export default function PaymentInfoPage() {
  const router = useRouter();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const countdown = useCountdown(checkoutUrl, isMounted);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchCheckoutUrl() {
      try {
		// console.log("Fetching checkout URL...");
        const url = await initiatePayment();
        setCheckoutUrl(url);
      } catch (error) {
        console.error("Failed to fetch checkout URL:", error);
        router.push("/dashboard");
      }
    }
    fetchCheckoutUrl();
  }, [isMounted, router]);

  const handleProceed = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  if (!isMounted) {
    return (
      <div className="\ mx-auto p-4 max-w-4xl flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Payment Information
        </h1>
        <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
          You are about to pay <strong>KES 1300</strong>, which is equivalent to{" "}
          <strong>$10 USD</strong> at an exchange rate of 130 KES/USD.
        </p>
        <p className="text-md mb-6 text-gray-600 dark:text-gray-300">
          Loading payment options...
        </p>
      </div>
    );
  }

  if (!checkoutUrl) {
    return (
      <div className=" mx-auto p-4 max-w-4xl flex flex-col items-center justify-center min-h-screen">
        Loading payment information...
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 max-w-4xl flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        Payment Information
      </h1>
      <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
        You are about to pay <strong>KES 1300</strong>, which is equivalent to{" "}
        <strong>$10 USD</strong> at an exchange rate of 130 KES/USD.
      </p>
      <p className="text-md mb-6 text-gray-600 dark:text-gray-300">
        Click the button below to proceed to checkout, or wait {countdown}{" "}
        seconds to be redirected automatically.
      </p>
      <button
        onClick={handleProceed}
        className="bg-[#8C50FB] text-white px-6 py-2 rounded hover:bg-[#9332ea] transition"
      >
        Proceed to Checkout Now
      </button>
    </div>
  );
}
