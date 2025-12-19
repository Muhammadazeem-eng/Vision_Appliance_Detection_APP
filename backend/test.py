from ultralytics import YOLO

# Load your trained model
model = YOLO(r"D:\runs\detect\train3\weights\best.pt")

# Run prediction on an image or folder
model.predict(
    source=r"C:\Users\muham\Downloads\files (3)\yolooo.png",  # put your test images here
    conf=0.25,
    save=True,
    show=False
)
