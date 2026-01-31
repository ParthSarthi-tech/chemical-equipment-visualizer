"use client";

import React from "react"

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Gauge,
  Thermometer,
  Database,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-3 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3 text-destructive" />
            ) : null}
            <span
              className={`text-xs font-medium ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { currentSummary } = useAppStore();

  if (!currentSummary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Equipment"
        value={currentSummary.totalCount}
        subtitle={`${Object.keys(currentSummary.typeDistribution).length} equipment types`}
        icon={<Database className="w-5 h-5 text-primary" />}
      />
      <StatCard
        title="Avg. Flowrate"
        value={`${currentSummary.averageFlowrate.toFixed(1)}`}
        subtitle={`Range: ${currentSummary.minFlowrate} - ${currentSummary.maxFlowrate} m³/h`}
        icon={<Activity className="w-5 h-5 text-primary" />}
        trend="up"
        trendValue="m³/h"
      />
      <StatCard
        title="Avg. Pressure"
        value={`${currentSummary.averagePressure.toFixed(1)}`}
        subtitle={`Range: ${currentSummary.minPressure} - ${currentSummary.maxPressure} bar`}
        icon={<Gauge className="w-5 h-5 text-primary" />}
        trend="neutral"
        trendValue="bar"
      />
      <StatCard
        title="Avg. Temperature"
        value={`${currentSummary.averageTemperature.toFixed(0)}`}
        subtitle={`Range: ${currentSummary.minTemperature} - ${currentSummary.maxTemperature} K`}
        icon={<Thermometer className="w-5 h-5 text-primary" />}
        trend="up"
        trendValue="K"
      />
    </div>
  );
}
