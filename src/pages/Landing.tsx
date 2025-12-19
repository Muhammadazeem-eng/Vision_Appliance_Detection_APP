import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Camera, Leaf, Zap, BarChart3, Scan, ShieldCheck } from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
                <div className="container px-4 md:px-6 mx-auto text-center space-y-8">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Research Prototype
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                        Vision-Language Appliance Detection
                        <br />
                        & Operational Context Inference
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-200">
                        A low-cost, sensor-free solution for SME carbon footprint monitoring using YOLOv8s and CLIP.
                        Process smartphone images in under two seconds to identify energy inefficiencies.
                    </p>
                    <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 fill-mode-both delay-300">
                        <Button size="lg" onClick={() => navigate("/analyze")} className="gap-2 text-lg h-12 px-8">
                            Start Analysis <ArrowRight className="h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg h-12 px-8">
                            Learn Methodology
                        </Button>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="py-16 bg-muted/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">The Methodology</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our proposed framework combines state-of-the-art object detection with semantic reasoning to infer operational context without sensors.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />

                        {[
                            {
                                icon: Camera,
                                title: "1. Input",
                                desc: "640x640 pixel smartphone imagery of the coffee shop interior."
                            },
                            {
                                icon: Scan,
                                title: "2. Detection",
                                desc: "Fine-tuned YOLOv8s detects 5 key appliance classes with mAP50 of 0.865."
                            },
                            {
                                icon: Brain,
                                title: "3. Inference",
                                desc: "CLIP VLM encodes regions and computes similarity with context prompts."
                            },
                            {
                                icon: BarChart3,
                                title: "4. Assignment",
                                desc: "Softmax normalization assigns the most probable operational context."
                            }
                        ].map((step, idx) => (
                            <Card key={idx} className="relative bg-background border-2 hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-center">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-sm text-muted-foreground">
                                    {step.desc}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features / Capabilities */}
            <section className="py-16">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Detection Capabilities</h2>
                            <p className="text-muted-foreground">
                                Trained on a curated dataset of 169 synthetic images (generated via Google Gemini) and validated on real-world scenes.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { label: "Coffee Machines", score: "99.5% mAP50" },
                                    { label: "Toasters", score: "99.4% mAP50" },
                                    { label: "Dishwashers", score: "89% mAP50" },
                                    { label: "Customer Fridges", score: "85% mAP50" },
                                    { label: "Light Fixtures", score: "Robust detection" }
                                ].map((item) => (
                                    <li key={item.label} className="flex items-center justify-between border-b pb-2">
                                        <span className="font-medium flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-success" /> {item.label}
                                        </span>
                                        <span className="text-sm text-muted-foreground">{item.score}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-muted rounded-xl p-8 space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="h-5 w-5 text-warning" />
                                Context Inference
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                CLIP-based semantic reasoning identifies visual factors associated with energy waste (similarity scores 0.56–0.99).
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    "Direct Sunlight Exposure",
                                    "Proximity to Heat Sources",
                                    "Daytime Artificial Lighting",
                                    "Active Usage States"
                                ].map((ctx) => (
                                    <div key={ctx} className="bg-background p-4 rounded-lg text-sm font-medium border shadow-sm">
                                        {ctx}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-16 bg-primary/5">
                <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl">
                    <Leaf className="h-12 w-12 text-success mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-6">Why This Matters</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        "A significant gap remains as no existing solution combines visual-language reasoning with appliance detection for emissions estimation in SMEs."
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="bg-background p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold mb-2">Sensor-Free</h4>
                            <p className="text-sm text-muted-foreground">No smart meters or IoT infrastructure required. Just a smartphone.</p>
                        </div>
                        <div className="bg-background p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold mb-2">Low Cost</h4>
                            <p className="text-sm text-muted-foreground">Accessible solution for financially constrained SMEs.</p>
                        </div>
                        <div className="bg-background p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold mb-2">Privacy Aware</h4>
                            <p className="text-sm text-muted-foreground">Local processing potential for edge deployment.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t mt-auto">
                <div className="container px-4 md:px-6 mx-auto text-center text-sm text-muted-foreground">
                    <p>Based on research by Al Azeem and Hu.</p>
                    <p className="mt-2">Vision-Language Appliance Detection and Operational Context Inference.</p>
                </div>
            </footer>
        </div>
    );
}
