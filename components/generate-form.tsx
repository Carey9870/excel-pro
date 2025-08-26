"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import { generateSchema } from "@/lib/zod-schemas";

type FormData = {
  input: string;
  outputType: "formula" | "vba" | "chart";
};

export function GenerateForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);

  // Fetch profile data
  const { data: profileData, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!isLoaded || !user) return null;
      const token = await window.Clerk.session?.getToken();
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: isLoaded && !!user,
  });

  useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: { outputType: "formula" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = await window.Clerk.session?.getToken();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate output");
      }
      return response.json();
    },
    onSuccess: async () => {
      await refetch(); // Refetch profile to get updated trialUses
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      queryClient.refetchQueries({ queryKey: ["queries"] });
      reset();
      toast.success("Output generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate output");
      if (error.message === "Trial limit reached. Please subscribe.") {
        router.push("/payment-info");
      }
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!profile) {
      toast.error("Profile not loaded. Please try again.");
      return;
    }

    // Check trial limit before submission
    if (profile.trialUses >= 2 && (!profile.subscription || profile.subscription !== "active")) {
      toast.error("Trial limit reached. Please subscribe to continue.");
      router.push("/payment-info");
      return;
    }

    mutation.mutate(data);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border-none p-6">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid">
            <div>
              <Label htmlFor="input" className="text-gray-700 dark:text-gray-300">
                Describe your Excel task
              </Label>
              <Textarea
                id="input"
                {...register("input")}
                placeholder="E.g., Sum column A from rows 1 to 10"
                className="mt-2 w-full resize-none h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {errors.input && (
                <p className="text-red-500 text-sm mt-1">{errors.input.message}</p>
              )}
            </div>
            <div className="mt-4">
              <Label className="text-gray-700 font-bold dark:text-gray-300">
                Output Type
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {["formula", "vba", "chart"].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={type}
                      value={type}
                      {...register("outputType")}
                      className="w-5 h-5 accent-teal-500"
                    />
                    <Label
                      htmlFor={type}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Generating..." : "Generate Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}