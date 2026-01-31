"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getHistory, downloadPDFReport, isDemoMode } from "@/lib/api";
import { convertApiSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  FileSpreadsheet,
  Clock,
  Database,
  Trash2,
  FileText,
  RefreshCw,
  Loader2,
  Server,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function UploadHistory() {
  const { uploadHistory, setUploadHistory, setCurrentData, clearHistory, demoMode } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (isDemoMode() || demoMode) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const historyData = await getHistory();
      const formattedHistory = historyData.map((item) => ({
        id: item.id,
        fileName: item.filename,
        uploadedAt: new Date(item.uploaded_at),
        recordCount: item.summary.total_equipment,
        summary: convertApiSummary(item.summary),
        data: [],
      }));
      setUploadHistory(formattedHistory);
    } catch (err) {
      setError("Failed to fetch history from server");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode() && !demoMode) {
      fetchHistory();
    }
    
  }, [demoMode]);
  
  const handleLoadFromHistory = (entry: typeof uploadHistory[0]) => {
    if (entry.data.length > 0) {
      setCurrentData(entry.data, entry.summary);
    }
  };

  const generateLocalPDF = (entry: typeof uploadHistory[0]) => {
    
    const report = `
CHEMICAL EQUIPMENT REPORT
========================
File: ${entry.fileName}
Date: ${new Date(entry.uploadedAt).toLocaleString()}

SUMMARY
-------
Total Equipment: ${entry.summary.totalCount}
Average Flowrate: ${entry.summary.averageFlowrate.toFixed(2)}
Average Pressure: ${entry.summary.averagePressure.toFixed(2)}
Average Temperature: ${entry.summary.averageTemperature.toFixed(2)}

TYPE DISTRIBUTION
-----------------
${Object.entries(entry.summary.typeDistribution)
  .map(([type, count]) => `${type}: ${count}`)
  .join("\n")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.fileName.replace(".csv", "")}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async (id: number, fileName: string) => {
    setDownloadingId(id);
    try {
      await downloadPDFReport(id, fileName);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">Loading history from server...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Server className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive text-sm font-medium">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure Django server is running
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            className="mt-4 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (uploadHistory.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No upload history</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a CSV file to see it here
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            className="mt-4 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Upload History
            </CardTitle>
            <CardDescription>
              {demoMode
                ? `Last ${uploadHistory.length} uploads (demo mode - local storage)`
                : `Last ${uploadHistory.length} uploads from Django database (max 5 stored)`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHistory}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {uploadHistory.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{entry.fileName}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(entry.uploadedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Database className="w-3 h-3" />
                    {entry.recordCount} records
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {Object.keys(entry.summary.typeDistribution)
                    .slice(0, 3)
                    .map((type) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="text-xs py-0"
                      >
                        {type}
                      </Badge>
                    ))}
                  {Object.keys(entry.summary.typeDistribution).length > 3 && (
                    <Badge variant="secondary" className="text-xs py-0">
                      +{Object.keys(entry.summary.typeDistribution).length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {demoMode && entry.data.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLoadFromHistory(entry)}
                  className="text-accent hover:bg-accent/10"
                >
                  Load Data
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  demoMode
                    ? generateLocalPDF(entry)
                    : handleDownloadPDF(entry.id, entry.fileName)
                }
                disabled={downloadingId === entry.id}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                {downloadingId === entry.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {demoMode ? "Report" : "PDF Report"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
