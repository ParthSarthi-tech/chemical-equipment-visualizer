"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function PDFReport() {
  const { currentData, currentSummary } = useAppStore();
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");

  const generatePDF = async () => {
    if (!currentSummary || currentData.length === 0) return;

    setStatus("generating");

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 2000));

      
      const pdfContent = `
CHEMICAL EQUIPMENT ANALYSIS REPORT
=====================================
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
------------------
Total Equipment: ${currentSummary.totalCount}
Equipment Types: ${Object.keys(currentSummary.typeDistribution).length}

AVERAGES
--------
Average Flowrate: ${currentSummary.averageFlowrate.toFixed(2)} m³/h
Average Pressure: ${currentSummary.averagePressure.toFixed(2)} bar
Average Temperature: ${currentSummary.averageTemperature.toFixed(2)} K

RANGES
------
Flowrate: ${currentSummary.minFlowrate} - ${currentSummary.maxFlowrate} m³/h
Pressure: ${currentSummary.minPressure} - ${currentSummary.maxPressure} bar
Temperature: ${currentSummary.minTemperature} - ${currentSummary.maxTemperature} K

TYPE DISTRIBUTION
-----------------
${Object.entries(currentSummary.typeDistribution)
  .map(([type, count]) => `${type}: ${count} units`)
  .join("\n")}

EQUIPMENT DETAILS
-----------------
${currentData
  .map(
    (item) =>
      `${item["Equipment Name"]} (${item.Type}): Flow=${item.Flowrate}, Pressure=${item.Pressure}, Temp=${item.Temperature}`
  )
  .join("\n")}
      `.trim();

      const blob = new Blob([pdfContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `equipment-report-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const hasData = currentSummary && currentData.length > 0;

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Generate Report
        </CardTitle>
        <CardDescription>
          Export a detailed analysis report of your equipment data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
          <h4 className="text-sm font-medium mb-3">Report Contents:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Summary statistics and averages
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Equipment type distribution
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Parameter ranges (min/max values)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Complete equipment listing
            </li>
          </ul>
        </div>

        <Button
          onClick={generatePDF}
          disabled={!hasData || status === "generating"}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {status === "generating" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Report...
            </span>
          ) : status === "success" ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Report Downloaded!
            </span>
          ) : status === "error" ? (
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Generation Failed
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {hasData ? "Download Report" : "No Data Available"}
            </span>
          )}
        </Button>

        {!hasData && (
          <p className="text-xs text-center text-muted-foreground">
            Upload equipment data to generate a report
          </p>
        )}
      </CardContent>
    </Card>
  );
}
