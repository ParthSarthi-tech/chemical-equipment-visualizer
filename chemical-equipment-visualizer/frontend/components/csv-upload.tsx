"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "@/lib/store";
import { parseCSV, calculateSummary } from "@/lib/data-utils";
import { uploadCSV, getHistory, isDemoMode } from "@/lib/api";
import { convertApiSummary } from "@/lib/types";
import { generateId } from "@/lib/data-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
} from "lucide-react";

export function CSVUpload() {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { setCurrentData, setUploadHistory, addToHistory, setActiveTab, demoMode } = useAppStore();

  const refreshHistory = useCallback(async () => {
    
    if (isDemoMode()) return;
    
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
    } catch (error) {
      console.error("Failed to refresh history:", error);
    }
  }, [setUploadHistory]);

  const processFile = useCallback(
    async (file: File) => {
      setUploadStatus("loading");
      setFileName(file.name);
      setErrorMessage("");

      try {
        
        const text = await file.text();
        const data = parseCSV(text);

        if (data.length === 0) {
          throw new Error("No valid data found in CSV");
        }

        let summary;

        if (demoMode || isDemoMode()) {
          
          summary = calculateSummary(data);
          
          
          addToHistory({
            id: Number(generateId().slice(0, 8)),
            fileName: file.name,
            uploadedAt: new Date(),
            recordCount: data.length,
            summary,
            data,
          });
        } else {
          
          const response = await uploadCSV(file);
          summary = convertApiSummary(response.summary, data);
          await refreshHistory();
        }

        setCurrentData(data, summary);
        setUploadStatus("success");

        
        setTimeout(() => {
          setActiveTab("data");
        }, 1500);
      } catch (err) {
        setUploadStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to upload CSV file"
        );
      }
    },
    [setCurrentData, setActiveTab, refreshHistory, demoMode, addToHistory]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleLoadSample = async () => {
    setUploadStatus("loading");
    setFileName("sample_equipment_data.csv");

    try {
      
      const sampleCSV = `Equipment Name,Type,Flowrate,Pressure,Temperature
Pump A,Pump,120,8.5,320
Pump B,Pump,135,9.0,330
Reactor 1,Reactor,200,15.0,450
Reactor 2,Reactor,210,14.5,460
Heat Exchanger 1,Heat Exchanger,180,12.0,400
Heat Exchanger 2,Heat Exchanger,175,11.8,395
Compressor A,Compressor,160,10.5,360
Compressor B,Compressor,165,10.8,365
Mixer 1,Mixer,90,5.0,280
Mixer 2,Mixer,95,5.2,285`;

      
      const sampleFile = new File([sampleCSV], "sample_equipment_data.csv", {
        type: "text/csv",
      });

      
      await processFile(sampleFile);
    } catch {
      setUploadStatus("error");
      setErrorMessage("Failed to load sample data");
    }
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload CSV Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file with equipment parameters (Equipment Name, Type,
          Flowrate, Pressure, Temperature)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-primary/50 hover:bg-accent/5"
            }
            ${uploadStatus === "success" ? "border-green-500/50 bg-green-500/5" : ""}
            ${uploadStatus === "error" ? "border-destructive/50 bg-destructive/5" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {uploadStatus === "loading" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium">Uploading {fileName}...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sending to Django backend
                  </p>
                </div>
              </>
            ) : uploadStatus === "success" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-500">
                    Upload Successful!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fileName} saved to database
                  </p>
                </div>
              </>
            ) : uploadStatus === "error" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Upload Failed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {errorMessage}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? "Drop the CSV file here"
                      : "Drag & drop a CSV file here"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
          <Server className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {demoMode
              ? "Demo mode: Data processed locally (no backend connection)"
              : "Files are uploaded to Django and stored in SQLite database"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <Button
          onClick={handleLoadSample}
          variant="outline"
          className="w-full border-border/50 hover:bg-accent/30 bg-transparent"
          disabled={uploadStatus === "loading"}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>
      </CardContent>
    </Card>
  );
}
