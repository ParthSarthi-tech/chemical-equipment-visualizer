"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TableIcon, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeColors: Record<string, string> = {
  Pump: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Reactor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Heat Exchanger": "bg-red-500/20 text-red-400 border-red-500/30",
  Compressor: "bg-green-500/20 text-green-400 border-green-500/30",
  Mixer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function DataTable() {
  const { currentData } = useAppStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const types = [...new Set(currentData.map((d) => d.Type))];

  const filteredData = currentData.filter((item) => {
    const matchesSearch =
      item["Equipment Name"].toLowerCase().includes(search.toLowerCase()) ||
      item.Type.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.Type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (currentData.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <TableIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No data available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a CSV file to see equipment data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-primary" />
              Equipment Data
            </CardTitle>
            <CardDescription>
              Showing {filteredData.length} of {currentData.length} records
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48 bg-input/50 border-border/50"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-input/50 border-border/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Equipment Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">
                  Flowrate (m³/h)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Pressure (bar)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Temperature (K)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-accent/10 transition-colors"
                >
                  <TableCell className="font-medium">
                    {item["Equipment Name"]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={typeColors[item.Type] || ""}
                    >
                      {item.Type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.Flowrate}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.Pressure}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.Temperature}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
