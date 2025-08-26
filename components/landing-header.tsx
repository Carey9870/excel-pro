import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingPageHeader() {
  return (
    <>
      <header className="bg-gradient-to-r from-[#111918] via-[#17413F] to-[#037C78] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">ExcelForYou</h1>
          <div className="flex items-center gap-4">
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
                  variant="default"
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-sm"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonTrigger: "text-white",
                  },
                }}
              />
            </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
