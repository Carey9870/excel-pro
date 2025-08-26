"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SignedIn, useUser } from "@clerk/nextjs";
import {
  UserButton,
  SignUpButton,
  SignInButton,
  SignedOut,
} from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { OutputCard } from "@/components/output-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { GenerateForm } from "@/components/generate-form";
import Link from "next/link";

interface Profile {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  paystackCustomerId: string | null;
  trialUses: number;
  subscription: string | null;
  subscriptionStart: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface HomeClientProps {
  initialProfile: Profile | null;
}

export default function Home({ initialProfile }: HomeClientProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const router = useRouter();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    async function checkUser() {
      try {
        if (!isSignedIn) {
          toast.error("Please sign in to continue.");
          router.push("/sign-in");
          return;
        }

        const token = await window.Clerk.session?.getToken();
        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const fetchedProfile = await response.json() as Profile;
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Error checking user:", error);
        toast.error("Error loading user data.");
      } finally {
        setIsCheckingSubscription(false);
      }
    }

    checkUser();
  }, [isLoaded, isSignedIn, user, router]);
  
    const paymentMutation = useMutation({
    mutationFn: async () => {
      router.push("/payment-info");
    },
    onError: (error) => toast.error(`Payment initiation failed: ${error.message}`),
  });

  const { data: queries, isLoading } = useQuery({
    queryKey: ["queries"],
    queryFn: async () => {
      const response = await fetch("/api/queries", {
        headers: { Authorization: `Bearer ${await window.Clerk.session?.getToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch queries");
      return response.json();
    },
    enabled: isSignedIn && isLoaded && profile && (profile.trialUses < 2 || profile.subscription === "active"),
  });

  if (!isLoaded || isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-gradient-to-r from-[#111918] via-[#17413F] to-[#037C78] text-white py-6 shadow-md">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="inline-block group">
              <h1 className="text-3xl font-bold tracking-tight">
                ExcelForYou
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              <SignedIn>				
				{profile && profile.subscription !== "active" && (
				  <Button
					onClick={() => paymentMutation.mutate()}
					className="border-white bg-teal-700 text-white hover:bg-teal-500 hover:text-white rounded-lg"
                  >
					Subscribe
				  </Button>
				)}
                <ThemeToggle />
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10",
                      userButtonTrigger: "text-white hover:bg-teal-500 rounded-lg",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-teal-500 hover:text-white rounded-lg"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-teal-500 hover:text-white rounded-lg"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
                <ThemeToggle />
              </SignedOut>
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create Excel Magic
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Generate powerful Excel formulas, VBA scripts, and stunning charts
            in seconds using natural human language.
          </p>
        </section>
        <main className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="generate-form">
              <GenerateForm profile={profile} setProfile={setProfile} />
            </div>
            <section className="border-2 p-2 border-dashed rounded-lg border-gray-500">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Recent Outputs
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-2">
                  <Skeleton className="h-7 w-full rounded-lg" />
                  <Skeleton className="h-7 w-3/4 rounded-lg" />
                  <Skeleton className="h-7 w-1/2 rounded-lg" />
                  <Skeleton className="h-7 w-1/3 rounded-lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <ScrollArea className="h-[300px] w-full rounded-md border border-dashed p-3">
                    <div className="space-y-4">
                      {Array.isArray(queries) &&
                        queries.map((query: any) => (
                          <OutputCard key={query.id} query={query} />
                        ))}
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </SignedIn>
  );
}