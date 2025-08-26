"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TryNowButton() {
  const router = useRouter();

  return (
    <Button
      size="lg"
      className="bg-teal-800 hover:bg-teal-600 text-white rounded-lg shadow-md"
      onClick={() => router.push("/dashboard")}
    >
      Try Now For Free
    </Button>
  );
}
