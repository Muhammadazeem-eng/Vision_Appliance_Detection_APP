import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle, CheckCircle2, Zap, Leaf } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { mockAnalysisResult } from "@/lib/mockData";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const COLORS = {
  low: "hsl(var(--success))",
  medium: "hsl(var(--warning))",
  high: "hsl(var(--destructive))",
};

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Try to get from sessionStorage first, otherwise use mock data
    const stored = sessionStorage.getItem("latestAnalysis");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      setResult(mockAnalysisResult);
    }
  }, [id]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analysis found</p>
          <Button onClick={() => navigate("/")}>Upload Image</Button>
        </div>
      </div>
    );
  }

  const chartData = result.applianceEstimates.map(est => ({
    name: est.class.replace(/_/g, " "),
    kgCO2: parseFloat(est.kgCO2Month.toFixed(2)),
    kWh: parseFloat(est.kwhMonth.toFixed(2)),
  }));

  const pieData = result.applianceEstimates.map(est => ({
    name: est.class.replace(/_/g, " "),
    value: parseFloat(est.kgCO2Month.toFixed(2)),
  }));

  const getEmissionLevel = (kgCO2: number) => {
    if (kgCO2 < 50) return { level: "low", label: "Low Impact", color: COLORS.low };
    if (kgCO2 < 150) return { level: "medium", label: "Medium Impact", color: COLORS.medium };
    return { level: "high", label: "High Impact", color: COLORS.high };
  };

  const handleExportPDF = () => {
    // In production, this would generate and download a PDF
    alert("PDF export functionality - to be implemented with your backend");
  };

  const handleExportCSV = () => {
    const csv = [
      ["Appliance", "Wattage (W)", "Hours/Day", "kWh/Month", "kgCO₂/Month"],
      ...result.applianceEstimates.map(est => [
        est.class,
        est.wattage,
        est.hoursPerDay,
        est.kwhMonth.toFixed(2),
        est.kgCO2Month.toFixed(2),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `energy-analysis-${result.id}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analysis Results</h2>
          <p className="text-muted-foreground">
            Detected {result.detections.length} appliances • {result.totalKgCO2Month.toFixed(2)} kgCO₂/month
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Image with Detections */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Appliances</CardTitle>
          <CardDescription>YOLO detection with confidence scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative inline-block">
            <img
              src={result.imageUrl}
              alt="Analysis"
              className="rounded-lg max-w-full"
            />
            {/* Bounding boxes would be drawn here with canvas/svg in production */}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.detections.map((det, idx) => (
              <Badge key={idx} variant="secondary">
                {det.class.replace(/_/g, " ")} ({(det.score * 100).toFixed(0)}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy & Emissions Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Energy</p>
                <p className="text-3xl font-bold text-foreground">{result.totalKwhMonth.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kWh/month</p>
              </div>
              <Zap className="h-12 w-12 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                <p className="text-3xl font-bold text-foreground">{result.totalKgCO2Month.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg/month</p>
              </div>
              <Leaf className="h-12 w-12 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Monthly Cost</p>
                <p className="text-3xl font-bold text-foreground">${(result.totalKwhMonth * 0.28).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">@ $0.28/kWh</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Appliance</CardTitle>
            <CardDescription>Monthly CO₂ emissions (kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="kgCO2" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emission Distribution</CardTitle>
            <CardDescription>Percentage of total CO₂</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Appliance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Appliance Details</CardTitle>
          <CardDescription>Energy consumption and context assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.applianceEstimates.map((est, idx) => {
              const emission = getEmissionLevel(est.kgCO2Month);
              return (
                <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg capitalize">
                      {est.class.replace(/_/g, " ")}
                    </h4>
                    <Badge style={{ backgroundColor: emission.color, color: "white" }}>
                      {emission.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Power</p>
                      <p className="font-medium">{est.wattage}W</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p className="font-medium">{est.hoursPerDay}h/day</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Energy</p>
                      <p className="font-medium">{est.kwhMonth.toFixed(1)} kWh</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Emissions</p>
                      <p className="font-medium">{est.kgCO2Month.toFixed(1)} kg</p>
                    </div>
                  </div>

                  {est.context && (
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <p className="text-sm font-medium text-foreground mb-1">
                        ⚠️ Context: {est.context.context}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {est.context.recommendation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {(est.context.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Recommendations
          </CardTitle>
          <CardDescription>AI-generated actionable insights</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-success text-success-foreground text-sm font-bold">
                  {idx + 1}
                </span>
                <p className="text-foreground pt-0.5">{rec}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
