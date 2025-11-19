export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

export interface ContextAssessment {
  context: string;
  confidence: number;
  recommendation?: string;
}

export interface ApplianceEstimate {
  class: string;
  wattage: number;
  hoursPerDay: number;
  kwhMonth: number;
  kgCO2Month: number;
  context?: ContextAssessment;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  detections: Detection[];
  applianceEstimates: ApplianceEstimate[];
  totalKgCO2Month: number;
  totalKwhMonth: number;
  recommendations: string[];
  timestamp: Date;
}

export interface ApplianceConfig {
  class: string;
  wattage: number;
  defaultHoursPerDay: number;
  dutyFactor?: number;
}
