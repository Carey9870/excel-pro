import { redirect } from "next/navigation";
import { FileSpreadsheet, Code, BarChart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TryNowButton from "@/components/try-button";
import { LandingPageHeader } from "@/components/landing-header";

import { initialProfile } from "@/lib/initial-profile";

export default async function LandingPage() {
  const profile = await initialProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LandingPageHeader />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Supercharge Your Excel Workflow
          </h2>
          <p className="text-xl text-gray-400 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Effortlessly generate Excel formulas, VBA code, and stunning charts
            using natural language.
          </p>
          <TryNowButton />
        </section>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-teal-500 mb-4" />
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Excel Formulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Generate complex Excel formulas instantly from plain English
                descriptions.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Code className="h-12 w-12 mx-auto text-teal-500 mb-4" />
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                VBA Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Create safe, efficient VBA scripts to automate your Excel tasks.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <BarChart className="h-12 w-12 mx-auto text-teal-500 mb-4" />
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Charts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Design stunning Excel charts with AI-generated VBA code, styled
                to perfection.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
