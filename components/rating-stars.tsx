"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RatingStarsProps {
  queryId: string;
  initialRating?: number;
}

export function RatingStars({ queryId, initialRating }: RatingStarsProps) {
  const queryClient = useQueryClient();
  const [currentRating, setCurrentRating] = useState(initialRating || 0);

  const mutation = useMutation({
    mutationFn: async (rating: number) => {
      const response = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, rating }),
      });
      if (!response.ok) throw new Error("Failed to submit rating");
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentRating(data.rating); // Update the state with the new rating
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      toast.success("Thank you for your rating!");
    },
    onError: () => toast.error("Failed to submit rating"),
  });

  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer ${
            currentRating >= star
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-400"
          }`}
          onClick={() => {
            if (!mutation.isPending) {
              setCurrentRating(star); // Optimistically update the UI
              mutation.mutate(star);
            }
          }}
        />
      ))}
    </div>
  );
}