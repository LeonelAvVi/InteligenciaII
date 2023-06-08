from ultralytics import YOLO
from flask import request, Flask, jsonify, send_from_directory
from waitress import serve
from PIL import Image
import json

app = Flask(__name__)

@app.route("/")
def root():
    """
    Site main page handler function.
    :return: Content of index.html file
    """
    with open("index.html") as file:
        return file.read()


@app.route("/detect", methods=["POST"])
def detect():
    """
        Handler of /detect POST endpoint
        Receives uploaded file with a name "image_file", 
        passes it through YOLOv8 object detection 
        network and returns an array of bounding boxes.
        :return: a JSON array of objects bounding 
        boxes in format 
        [[x1,y1,x2,y2,object_type,probability],..]
    """
    buf = request.files["image_file"]
    # boxes = detect_objects_on_image(Image.open(buf.stream))
    boxes = detect_segmentation_on_image(Image.open(buf.stream))
    return jsonify(boxes)   

@app.route("/<path:filename>")
def static_file(filename):
  return send_from_directory("static",filename)


def detect_objects_on_image(buf):
    """
    Function receives an image,
    passes it through YOLOv8 neural network
    and returns an array of detected objects
    and their bounding boxes
    :param buf: Input image file stream
    :return: Array of bounding boxes in format 
    [[x1,y1,x2,y2,object_type,probability],..]
    """
    model = YOLO("best_fruit.pt")
    results = model.predict(buf)
    result = results[0]
    output = []
    for box in result.boxes:
        x1, y1, x2, y2 = [
          round(x) for x in box.xyxy[0].tolist()
        ]
        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        output.append([
          x1, y1, x2, y2, result.names[class_id], prob
        ])
    print('x1 x2 y1 y2:')
    print(output)
    return output

# funcion para obtener la segmentacion de la imagen mask
def detect_segmentation_on_image(buf):
    """
    Function receives an image,
    passes it through YOLOv8 neural network
    and returns an array of detected objects
    and their bounding boxes
    :param buf: Input image file stream
    :return: Array of bounding boxes in format 
    [[x1,y1,x2,y2,object_type,probability],..]
    """
    model = YOLO("best_fruit.pt")
    results = model.predict(buf)
    result = results[0]
    output = []
    aux = 0
    for box in result.boxes:

        x1, y1, x2, y2 = [
          round(x) for x in box.xyxy[0].tolist()
        ]
        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        mask = result.masks.data[aux]
        output.append([
          x1, y1, x2, y2, result.names[class_id], prob, mask.tolist()
        ])
        aux = aux + 1
        print('mask:')
        print(mask.shape)
        print(len(mask.tolist()))
    """	
    outputMasks = []
    for mask in result.masks.data:
        print('mask f :')
        print(mask)
        outputMasks.append(mask.tolist())
    # print('masks:')
    # print(result.masks.data)
    """	
    return output

serve(app, host='0.0.0.0', port=5000)