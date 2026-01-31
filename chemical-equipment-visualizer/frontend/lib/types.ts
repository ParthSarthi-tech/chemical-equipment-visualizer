export interface EquipmentData {
  "Equipment Name": string;
  Type: string;
  Flowrate: number;
  Pressure: number;
  Temperature: number;
}

export interface DataSummary {
  totalCount: number;
  averageFlowrate: number;
  averagePressure: number;
  averageTemperature: number;
  typeDistribution: Record<string, number>;
  minFlowrate: number;
  maxFlowrate: number;
  minPressure: number;
  maxPressure: number;
  minTemperature: number;
  maxTemperature: number;
}

export interface ApiSummary {
  total_equipment: number;
  avg_flowrate: number;
  avg_pressure: number;
  avg_temperature: number;
  type_distribution: Record<string, number>;
}

export function convertApiSummary(api: ApiSummary, data?: EquipmentData[]): DataSummary {
  const flowrates = data?.map((d) => d.Flowrate) || [];
  const pressures = data?.map((d) => d.Pressure) || [];
  const temperatures = data?.map((d) => d.Temperature) || [];

  return {
    totalCount: api.total_equipment,
    averageFlowrate: api.avg_flowrate,
    averagePressure: api.avg_pressure,
    averageTemperature: api.avg_temperature,
    typeDistribution: api.type_distribution,
    minFlowrate: flowrates.length ? Math.min(...flowrates) : 0,
    maxFlowrate: flowrates.length ? Math.max(...flowrates) : 0,
    minPressure: pressures.length ? Math.min(...pressures) : 0,
    maxPressure: pressures.length ? Math.max(...pressures) : 0,
    minTemperature: temperatures.length ? Math.min(...temperatures) : 0,
    maxTemperature: temperatures.length ? Math.max(...temperatures) : 0,
  };
}

export interface UploadHistory {
  id: number; 
  fileName: string;
  uploadedAt: Date;
  recordCount: number;
  summary: DataSummary;
  data: EquipmentData[];
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
