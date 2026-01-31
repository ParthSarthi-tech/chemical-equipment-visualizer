"use client";

import { useAppStore } from "@/lib/store";
import { DashboardHeader } from "@/components/dashboard-header";
import { CSVUpload } from "@/components/csv-upload";
import { StatsCards } from "@/components/stats-cards";
import { DataTable } from "@/components/data-table";
import { DataCharts } from "@/components/data-charts";
import { UploadHistory } from "@/components/upload-history";
import { PDFReport } from "@/components/pdf-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Table,
  BarChart3,
  History,
  FileText,
} from "lucide-react";

export function Dashboard() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-card/50 border border-border/50 p-1">
              <TabsTrigger
                value="upload"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger
                value="report"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CSVUpload />
              <UploadHistory />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-0">
            <StatsCards />
            <DataTable />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-0">
            <StatsCards />
            <DataCharts />
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-0">
            <UploadHistory />
          </TabsContent>

          <TabsContent value="report" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StatsCards />
              </div>
              <PDFReport />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>ChemViz - Chemical Equipment Parameter Visualizer v1.0</p>
            <p>Built with React, Next.js & Recharts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
