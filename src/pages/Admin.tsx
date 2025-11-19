import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { defaultApplianceConfigs, gridEmissionFactor } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw } from "lucide-react";

export default function Admin() {
  const [configs, setConfigs] = useState(defaultApplianceConfigs);
  const [emissionFactor, setEmissionFactor] = useState(gridEmissionFactor);
  const { toast } = useToast();

  const handleWattageChange = (index: number, value: string) => {
    const newConfigs = [...configs];
    newConfigs[index].wattage = parseFloat(value) || 0;
    setConfigs(newConfigs);
  };

  const handleHoursChange = (index: number, value: string) => {
    const newConfigs = [...configs];
    newConfigs[index].defaultHoursPerDay = parseFloat(value) || 0;
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    // In production, this would save to backend/database
    toast({
      title: "Settings saved",
      description: "Appliance configurations updated successfully",
    });
  };

  const handleReset = () => {
    setConfigs(defaultApplianceConfigs);
    setEmissionFactor(gridEmissionFactor);
    toast({
      title: "Settings reset",
      description: "Restored to default values",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configuration Settings</h2>
        <p className="text-muted-foreground">
          Customize appliance wattages and emission factors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grid Emission Factor</CardTitle>
          <CardDescription>
            Regional CO₂ emission factor (kgCO₂ per kWh)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="emission-factor">Emission Factor (kgCO₂/kWh)</Label>
            <Input
              id="emission-factor"
              type="number"
              step="0.01"
              value={emissionFactor}
              onChange={(e) => setEmissionFactor(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Default: 0.7 (Australia) • USA: ~0.4 • EU: ~0.3
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appliance Database</CardTitle>
          <CardDescription>
            Default power consumption and operating hours for detected appliances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {configs.map((config, index) => (
              <div key={config.class} className="border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-4 capitalize text-foreground">
                  {config.class.replace(/_/g, " ")}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`wattage-${index}`}>Wattage (W)</Label>
                    <Input
                      id={`wattage-${index}`}
                      type="number"
                      value={config.wattage}
                      onChange={(e) => handleWattageChange(index, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`hours-${index}`}>Default Hours/Day</Label>
                    <Input
                      id={`hours-${index}`}
                      type="number"
                      step="0.1"
                      value={config.defaultHoursPerDay}
                      onChange={(e) => handleHoursChange(index, e.target.value)}
                    />
                  </div>
                </div>
                {config.dutyFactor && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Duty factor: {(config.dutyFactor * 100).toFixed(0)}% (applied automatically)
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card className="bg-muted/50 border-none">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 text-foreground">Integration Notes</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• These settings will be sent to the backend API for analysis calculations</li>
            <li>• Changes apply to new analyses only (existing results remain unchanged)</li>
            <li>• Production version will persist settings to database</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
