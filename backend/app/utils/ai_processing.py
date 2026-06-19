import random

CLASSES = ["seagrass", "coral", "kelp"]

def classify_image(file_path: str):
    return {"label": random.choice(CLASSES)}  # random for now
