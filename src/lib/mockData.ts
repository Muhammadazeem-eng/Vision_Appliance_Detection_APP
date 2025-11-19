import { AnalysisResult, ApplianceConfig } from "@/types/analysis";

export const defaultApplianceConfigs: ApplianceConfig[] = [
  { class: "coffee_machine", wattage: 1500, defaultHoursPerDay: 8 },
  { class: "customer_fridge", wattage: 200, defaultHoursPerDay: 24, dutyFactor: 0.4 },
  { class: "dishwasher", wattage: 1800, defaultHoursPerDay: 1 },
  { class: "toaster", wattage: 1200, defaultHoursPerDay: 1.5 },
  { class: "light_fixture", wattage: 15, defaultHoursPerDay: 10 },
];

export const gridEmissionFactor = 0.7; // kgCO2/kWh (Australia default)

export const mockAnalysisResult: AnalysisResult = {
  id: "demo-analysis-001",
  imageUrl: "/placeholder.svg",
  timestamp: new Date(),
  detections: [
    { class: "coffee_machine", score: 0.96, bbox: [100, 200, 300, 250] },
    { class: "customer_fridge", score: 0.92, bbox: [400, 50, 200, 400] },
    { class: "light_fixture", score: 0.88, bbox: [50, 30, 80, 60] },
    { class: "light_fixture", score: 0.85, bbox: [600, 35, 75, 55] },
    { class: "toaster", score: 0.79, bbox: [250, 350, 150, 120] },
  ],
  applianceEstimates: [
    {
      class: "customer_fridge",
      wattage: 200,
      hoursPerDay: 24,
      kwhMonth: 57.6,
      kgCO2Month: 40.32,
      context: {
        context: "Fridge exposed to direct sunlight",
        confidence: 0.82,
        recommendation: "Move fridge away from direct sunlight to improve efficiency by 15-25%"
      }
    },
    {
      class: "coffee_machine",
      wattage: 1500,
      hoursPerDay: 8,
      kwhMonth: 360,
      kgCO2Month: 252,
    },
    {
      class: "light_fixture",
      wattage: 30, // 2 fixtures × 15W
      hoursPerDay: 10,
      kwhMonth: 9,
      kgCO2Month: 6.3,
      context: {
        context: "Lights on during daytime hours",
        confidence: 0.76,
        recommendation: "Install motion sensors or timers to reduce daytime lighting usage"
      }
    },
    {
      class: "toaster",
      wattage: 1200,
      hoursPerDay: 1.5,
      kwhMonth: 54,
      kgCO2Month: 37.8,
    },
  ],
  totalKwhMonth: 480.6,
  totalKgCO2Month: 336.42,
  recommendations: [
    "Relocate customer fridge away from direct sunlight - potential 15-25% efficiency improvement",
    "Install motion sensors or timers for lighting fixtures during daytime hours",
    "Consider upgrading coffee machine to energy-efficient model with auto-shutoff",
    "Schedule dishwasher operations during off-peak hours when available",
    "Regular maintenance check on refrigeration units to ensure optimal performance",
  ]
};

export const generateMockAnalysis = (imageUrl: string): AnalysisResult => {
  return {
    ...mockAnalysisResult,
    id: `analysis-${Date.now()}`,
    imageUrl,
    timestamp: new Date(),
  };
};
