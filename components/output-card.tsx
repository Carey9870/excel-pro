"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-dark.css";
import { Chart, registerables } from "chart.js";

import { Button } from "@/components/ui/button";

import { RatingStars } from "@/components/rating-stars";
import { Card, CardContent } from "@/components/ui/card";

import { Query } from "@/types";

Chart.register(...registerables);

interface OutputCardProps {
  query: Query;
}

export function OutputCard({ query }: OutputCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
    let chartInstance: Chart | undefined;

    if (query.outputType === "chart") {
      const canvas = document.getElementById(
        `chart-${query.id}`
      ) as HTMLCanvasElement;
      if (canvas) {
        // Destroy existing chart instance if it exists
        if (chartInstance) {
          chartInstance.destroy();
        }

        const data = {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Sample Data",
              data: [65, 59, 80, 81, 56],
              backgroundColor: ["#1E3A8A", "#064E3B", "#60A5FA", "#2DD4BF"],
            },
          ],
        };
        chartInstance = new Chart(canvas, {
          type: query.output.includes("xlPie") ? "pie" : "bar",
          data,
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }

    // Cleanup function to destroy the chart when the component unmounts or query changes
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [query]); // Dependency on query to re-run when query changes

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query.output);
    setIsCopied(true);
    toast.success("Output copied to clipboard!");
    setTimeout(() => {
      setIsCopied(false);
    }, 3000); // 3000ms = 3 seconds
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <CardContent className="w-[500px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white max-w-[90%] break-words overflow-hidden">
            {query.input}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-teal-500 hover:text-teal-600"
          >
            {isCopied ? (
              <Check className=" border-2 border-white h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {query.outputType === "chart" && (
          <div className="mb-4 h-48">
            <canvas id={`chart-${query.id}`} className="w-full h-full" />
          </div>
        )}
        <pre className="bg-gray-800 text-white rounded-lg w-full overflow-x-auto p-4">
          <code
            className={
              query.outputType === "vba" ? "language-vbscript" : "language-text"
            }
          >
            {query.output}
          </code>
        </pre>
        <div className="mt-4">
          <RatingStars queryId={query.id} initialRating={query.rating} />
        </div>
      </CardContent>
    </Card>
  );
}

//------------------------------------

// "use client";

// import { useEffect } from "react";
// import { toast } from "sonner";
// import { Copy } from "lucide-react";
// import Prism from "prismjs";
// import "prismjs/themes/prism-dark.css";
// import { Chart, registerables } from "chart.js";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// import { RatingStars } from "@/components/rating-stars";

// import { Query } from "@/types";

// Chart.register(...registerables);

// interface OutputCardProps {
// query: Query;
// }

// export function OutputCard({ query }: OutputCardProps) {
// useEffect(() => {
// Prism.highlightAll();
// if (query.outputType === "chart") {
// const canvas = document.getElementById(
// `chart-${query.id}`
// ) as HTMLCanvasElement;
// if (canvas) {
// const data = {
// labels: ["Jan", "Feb", "Mar", "Apr", "May"],
// datasets: [
// {
// label: "Sample Data",
// data: [65, 59, 80, 81, 56],
// backgroundColor: ["#1E3A8A", "#064E3B", "#60A5FA", "#2DD4BF"],
// },
// ],
// };
// new Chart(canvas, {
// type: query.output.includes("xlPie") ? "pie" : "bar",
// data,
// options: { responsive: true, maintainAspectRatio: false },
// });
// }
// }
// }, [query]);

// const copyToClipboard = () => {
// navigator.clipboard.writeText(query.output);
// toast.success("Output copied to clipboard!");
// };

// return (
// <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
// <CardContent className="p-4">
// <div className="flex justify-between items-center mb-4">
// <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// {query.input}
// </h3>
// <Button
// variant="ghost"
// size="sm"
// onClick={copyToClipboard}
// className="text-teal-500 hover:text-teal-600"
// >
// <Copy className="h-4 w-4" />
// </Button>
// </div>
// {query.outputType === "chart" && (
// <div className="mb-4 h-48">
// <canvas id={`chart-${query.id}`} className="w-full h-full" />
// </div>
// )}
// <pre className="bg-gray-800 text-white p-3 rounded-lg overflow-x-auto">
// <code
// className={
// query.outputType === "vba" ? "language-vbscript" : "language-text"
// }
// >
// {query.output}
// </code>
// </pre>
// <div className="mt-4">
// <RatingStars queryId={query.id} initialRating={query.rating} />
// </div>
// </CardContent>
// </Card>
// );
// }
