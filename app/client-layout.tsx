"use client";

import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/theme-provider";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 1000, // Cache queries for 1 minute
      refetchOnWindowFocus: true, // Prevent refetching on window focus
    },
  },
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <main>{children}</main>
        <Toaster richColors position="top-right" closeButton duration={5000} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
