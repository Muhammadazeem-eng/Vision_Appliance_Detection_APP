from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import uvicorn
from ultralytics import YOLO
import clip
import torch
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path
import io

# ==================== CONFIGURATION ====================
YOLO_MODEL_PATH = r"D:\runs\detect\train3\weights\best.pt"

PROMPTS = {
    "coffee_machine": [
        "coffee machine in use",
        "coffee machine idle",
        "coffee machine in sunlight",
        "coffee machine near heat source"
    ],
    "customer_fridge": [
        "fridge in sunlight",
        "fridge in shade",
        "fridge near heat source",
        "fridge door open"
    ],
    "dishwasher": [
        "dishwasher running",
        "dishwasher closed",
        "dishwasher near heat source",
        "dishwasher door open"
    ],
    "light_fixture": [
        "lights on daytime",
        "lights on dark room",
        "lights off",
        "lights near window"
    ],
    "toaster": [
        "toaster in use",
        "toaster idle",
        "toaster in sunlight",
        "toaster near heat source"
    ]
}

# ==================== LOAD MODELS ====================
print("Loading YOLO model...")
yolo = YOLO(YOLO_MODEL_PATH)

print("Loading CLIP model...")
clip_model, preprocess = clip.load("ViT-B/32", device="cpu")

app = FastAPI(title="YOLO + CLIP Context API")

# ==================== HELPER FUNCTIONS ====================
def expand_bbox(xyxy, factor=1.5, img_width=1000, img_height=1000):
    x1, y1, x2, y2 = xyxy.cpu().numpy()
    w, h = x2 - x1, y2 - y1
    cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
    new_w, new_h = w * factor, h * factor

    new_x1 = max(0, cx - new_w / 2)
    new_y1 = max(0, cy - new_h / 2)
    new_x2 = min(img_width, cx + new_w / 2)
    new_y2 = min(img_height, cy + new_h / 2)

    return [new_x1, new_y1, new_x2, new_y2]


def detect_context(image, bbox, appliance_type, img_width, img_height):
    crop_coords = expand_bbox(bbox, factor=1.5, img_width=img_width, img_height=img_height)
    crop = image.crop(crop_coords)

    text_descriptions = PROMPTS[appliance_type]
    text_tokens = clip.tokenize(text_descriptions).to("cpu")
    image_input = preprocess(crop).unsqueeze(0)

    with torch.no_grad():
        logits_per_image, _ = clip_model(image_input, text_tokens)
        probs = logits_per_image.softmax(dim=-1)
        best_idx = probs.argmax().item()

    return text_descriptions[best_idx], probs[0, best_idx].item()


def analyze_image(image: Image.Image):
    img_width, img_height = image.size
    results = yolo(image, conf=0.4)

    detections = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls)
            cls_name = r.names[cls_id]

            if cls_name not in PROMPTS:
                continue

            bbox = box.xyxy[0]
            context, clip_conf = detect_context(
                image, bbox, cls_name, img_width, img_height
            )

            detections.append({
                "appliance": cls_name,
                "bbox": bbox.cpu().numpy(),
                "context": context,
                "clip_conf": clip_conf
            })

    return detections


def visualize_results(image, detections):
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.imshow(image)

    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        label = f"{det['appliance']}\n{det['context']}\nCLIP: {det['clip_conf']:.2f}"

        rect = patches.Rectangle(
            (x1, y1), x2 - x1, y2 - y1,
            linewidth=1, edgecolor="red", facecolor="none"
        )
        ax.add_patch(rect)

        ax.text(
            x1, y1 - 7, label,
            color="white",
            fontsize=14,
            weight="bold",
            bbox=dict(facecolor="red", alpha=0.7, pad=3)
        )

    plt.axis("off")

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", dpi=200)
    plt.close()
    buf.seek(0)
    return buf

# ==================== API ENDPOINT ====================
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")

    detections = analyze_image(image)
    result_image = visualize_results(image, detections)

    return StreamingResponse(
        result_image,
        media_type="image/png"
    )

# ==================== RUN ====================
# uvicorn app:app --host 0.0.0.0 --port 8000

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)