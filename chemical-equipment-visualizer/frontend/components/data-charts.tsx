"use client";

import { useAppStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, LineChartIcon, Radar as RadarIcon } from "lucide-react";


const COLORS = ["#22d3ee", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];

export function DataCharts() {
  const { currentData, currentSummary } = useAppStore();

  if (!currentSummary || currentData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card/30">
            <CardContent className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Upload data to view charts
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  
  const barData = currentData.map((item) => ({
    name: item["Equipment Name"].replace(/\s+\d+$/, "").substring(0, 8),
    fullName: item["Equipment Name"],
    Flowrate: item.Flowrate,
    Pressure: item.Pressure * 10, 
    Temperature: item.Temperature / 10, 
  }));

  
  const pieData = Object.entries(currentSummary.typeDistribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  
  const lineData = currentData.map((item, index) => ({
    index: index + 1,
    name: item["Equipment Name"],
    Flowrate: item.Flowrate,
    Pressure: item.Pressure,
    Temperature: item.Temperature,
  }));


  const typeGroups: Record<string, { flowrate: number[]; pressure: number[]; temperature: number[] }> = {};
  for (const item of currentData) {
    if (!typeGroups[item.Type]) {
      typeGroups[item.Type] = { flowrate: [], pressure: [], temperature: [] };
    }
    typeGroups[item.Type].flowrate.push(item.Flowrate);
    typeGroups[item.Type].pressure.push(item.Pressure);
    typeGroups[item.Type].temperature.push(item.Temperature);
  }

  const radarData = Object.entries(typeGroups).map(([type, values]) => ({
    type,
    Flowrate: values.flowrate.reduce((a, b) => a + b, 0) / values.flowrate.length,
    Pressure: values.pressure.reduce((a, b) => a + b, 0) / values.pressure.length * 10,
    Temperature: values.temperature.reduce((a, b) => a + b, 0) / values.temperature.length / 10,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Equipment Comparison */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Equipment Comparison
          </CardTitle>
          <CardDescription>
            Flowrate, Pressure (×10), and Temperature (÷10) by equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Flowrate" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pressure" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Temperature" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Type Distribution */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Equipment Type Distribution
          </CardTitle>
          <CardDescription>
            Number of equipment by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#64748b" }}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">
                            {payload[0].name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Count: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart - Trends */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="w-5 h-5 text-primary" />
            Parameter Trends
          </CardTitle>
          <CardDescription>
            Flowrate and Temperature across equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="index"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Flowrate"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: "#22d3ee", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart - Type Averages */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RadarIcon className="w-5 h-5 text-primary" />
            Average Parameters by Type
          </CardTitle>
          <CardDescription>
            Comparative analysis of equipment types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="type" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Radar
                  name="Flowrate"
                  dataKey="Flowrate"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Pressure"
                  dataKey="Pressure"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.3}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
