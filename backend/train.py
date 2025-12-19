from ultralytics import YOLO

model = YOLO("yolov8s.pt")  # or yolov8n.pt (smaller & faster)
model.train(
    data=r"D:\work\coffee\dataset\data.yaml",
    epochs=50,
    imgsz=640,
    batch=8
)
