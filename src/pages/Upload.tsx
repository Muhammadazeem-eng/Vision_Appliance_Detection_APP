import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      // 1. Prepare base64 for OpenAI
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      const base64Image = await base64Promise;

      // 2. Parallel execution: Upload to local API (visuals) and OpenAI (data)
      const { uploadImage } = await import("@/lib/api");
      const { analyzeImage } = await import("@/lib/openai");

      const [uploadResult, energyAnalysis] = await Promise.all([
        uploadImage(selectedFile),
        analyzeImage(base64Image)
      ]);

      // 3. Construct final result
      const result = {
        id: crypto.randomUUID(),
        imageUrl: uploadResult.image_url || previewUrl, // Use annotated image from local API if available
        detections: energyAnalysis.detections || [], // Use OpenAI detections (or dummy ones)
        ...energyAnalysis,
        timestamp: new Date(),
      };

      // Store result in sessionStorage for the results page
      sessionStorage.setItem("latestAnalysis", JSON.stringify(result));

      toast({
        title: "Analysis complete!",
        description: `Analyzed appliances with ${result.totalKgCO2Month.toFixed(2)} kgCO₂/month`,
      });

      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Upload Image Here</h2>
        <p className="text-muted-foreground">
          Our AI will detect appliances and analyze energy efficiency
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Image Upload</CardTitle>
          <CardDescription>
            Upload a photo of a coffee shop interior to detect appliances and estimate CO₂ emissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
              ${isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
            />

            {!previewUrl ? (
              <label htmlFor="file-upload" className="cursor-pointer block">
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: JPG, PNG, WEBP (max 20MB)
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-96 mx-auto rounded-lg shadow-lg"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                  >
                    Remove
                  </Button>
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Change Image</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-none">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-foreground">Detection Capabilities:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {["Coffee Machines", "Refrigerators", "Dishwashers", "Toasters", "Light Fixtures", "And more..."].map(item => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
