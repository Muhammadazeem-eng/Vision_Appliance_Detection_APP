import { Detection, AnalysisResult, ApplianceEstimate } from "@/types/analysis";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function analyzeImage(
    imageBase64: string
): Promise<Omit<AnalysisResult, "id" | "imageUrl" | "timestamp">> {
    if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key is missing");
    }

    const prompt = `
    Analyze this image of a coffee shop. Identify all electrical appliances visible (e.g., coffee machines, grinders, fridges, lights, HVAC, blenders, toasters, payment terminals).
    
    For each appliance class found, provide a REALISTIC estimate based on the visual evidence (e.g., size, type, commercial vs home grade):
    1. Wattage (specific to the device shown)
    2. Hours used per day (typical for a busy coffee shop)
    3. Monthly kWh (assuming 30 days)
    4. Monthly CO2 emissions (kg) (use 0.4 kgCO2/kWh or a more specific factor if known)
    5. A context assessment (e.g., "High energy consumer due to size", "Energy star rated likely") and a recommendation.

    Also provide:
    - Total Monthly kWh (sum of all appliances)
    - Total Monthly CO2 Emissions (kg)
    - 3-5 actionable recommendations for energy saving specific to the detected equipment.

    Return ONLY valid JSON matching this structure:
    {
      "detections": [
         { "class": "string (appliance name)", "score": 0.95, "bbox": [0,0,0,0] } // List every appliance found. bbox can be [0,0,0,0] as we are using the annotated image for visuals.
      ],
      "applianceEstimates": [
        {
          "class": "string (matching detection class)",
          "wattage": number,
          "hoursPerDay": number,
          "kwhMonth": number,
          "kgCO2Month": number,
          "context": {
            "context": "string",
            "confidence": number (0-1),
            "recommendation": "string"
          }
        }
      ],
      "totalKwhMonth": number,
      "totalKgCO2Month": number,
      "recommendations": ["string", "string", "..."]
    }
  `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert energy auditor for commercial coffee shops. Output JSON only.",
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API call failed: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse OpenAI response", content);
        throw new Error("Invalid JSON response from OpenAI");
    }
}
