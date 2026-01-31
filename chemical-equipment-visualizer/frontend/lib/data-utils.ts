import type { EquipmentData, DataSummary } from "./types";

export function parseCSV(csvText: string): EquipmentData[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return {
      "Equipment Name": values[headers.indexOf("Equipment Name")] || "",
      Type: values[headers.indexOf("Type")] || "",
      Flowrate: parseFloat(values[headers.indexOf("Flowrate")]) || 0,
      Pressure: parseFloat(values[headers.indexOf("Pressure")]) || 0,
      Temperature: parseFloat(values[headers.indexOf("Temperature")]) || 0,
    };
  });
}

export function calculateSummary(data: EquipmentData[]): DataSummary {
  if (data.length === 0) {
    return {
      totalCount: 0,
      averageFlowrate: 0,
      averagePressure: 0,
      averageTemperature: 0,
      typeDistribution: {},
      minFlowrate: 0,
      maxFlowrate: 0,
      minPressure: 0,
      maxPressure: 0,
      minTemperature: 0,
      maxTemperature: 0,
    };
  }

  const flowrates = data.map((d) => d.Flowrate);
  const pressures = data.map((d) => d.Pressure);
  const temperatures = data.map((d) => d.Temperature);

  const typeDistribution: Record<string, number> = {};
  for (const item of data) {
    typeDistribution[item.Type] = (typeDistribution[item.Type] || 0) + 1;
  }

  return {
    totalCount: data.length,
    averageFlowrate:
      flowrates.reduce((a, b) => a + b, 0) / flowrates.length,
    averagePressure:
      pressures.reduce((a, b) => a + b, 0) / pressures.length,
    averageTemperature:
      temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
    typeDistribution,
    minFlowrate: Math.min(...flowrates),
    maxFlowrate: Math.max(...flowrates),
    minPressure: Math.min(...pressures),
    maxPressure: Math.max(...pressures),
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
