from image_recognition import RecognizeImage
from value_image import ValueImage
import os

from flask import Flask
from flask import request

app = Flask(__name__)

imgr = RecognizeImage()
valuer = ValueImage()


@app.route('/test-endpoint')
def hello_world():
    return 'Hello, World!'


@app.route('/get_info', methods=['GET', 'POST'])
def get_info():
    data = request.get_json()
    image = data['image']
    label = imgr.classify_image(image)
    price = valuer.value_label(label)
    return label, price


app.run()
