from image_recognition import RecognizeImage
from value_image import ValueImage
import os
import numpy as np
import base64
from flask import Flask
from flask import request
import uuid
import boto3
from flask import jsonify
from flask_socketio import SocketIO, emit

import cv2
sid_list = set()
ACCESS_KEY = os.environ['ACCESS_KEY']
SECRET_KEY = os.environ['SECRET_KEY']


def draw_bounding_box(img_bytes, label, confidence, x, y, x_plus_w, y_plus_h):
    color = np.random.uniform(0, 255, size=(3,))
    nparr = np.fromstring(img_bytes, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    print(x, y, x_plus_w, y_plus_h)
    if x == 0 and y == 0 and x_plus_w == 0 and y_plus_h == 0:
        height, width, _ = img_np.shape
        cv2.rectangle(img_np, (40, 40), (width - 40, height - 40), color, 2)
        # cv2.putText(img_np, label, (40, 35),
        #            cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 1)
    else:

        height, width, _ = img_np.shape
        print("WHAT???????", x, y, x_plus_w, y_plus_h)
        cv2.rectangle(img_np, (int(x*width), int(height*y)),
                      (int(x_plus_w*width), int(y_plus_h*height)), color, 2)
        # cv2.putText(img_np, label, (int(x*width), int(y*height)-5),
        #            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    if not cv2.imwrite(os.path.abspath('flask-computer-vision/public/temp.jpg'), img_np):
        print("huh?")
    return 'temp.jpg'


app = Flask(__name__, static_folder='public', static_url_path='')

socketio = SocketIO(app)
imgr = RecognizeImage(boto3.client(
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name='us-east-1',
    service_name='rekognition'
))
lex_client = boto3.client(aws_access_key_id=ACCESS_KEY,
                          aws_secret_access_key=SECRET_KEY,
                          region_name='us-east-1',
                          service_name='lex-runtime')
valuer = ValueImage()
img_b64 = ""


def get_info(image, token):
    image = base64.b64decode(image)
    label, x, y, width, height = imgr.classify_image(image)
    price = valuer.value_label(label)
    duration = user_info_dict[token]['duration']
    loc = draw_bounding_box(
        image, '%s - estimated price: $%0.2f' % (label, price), 1, x, y, x + width, y + height)
    risk = 0.01
    premium = (price * 0.2 + price * risk) / 365.0 * duration
    socketio.emit('img', [loc, label, '$%0.2f' %
                          price, '%0.2f%%' % (risk * 100), '$%0.2f/day' % (premium)])
    if 'premium' in user_info_dict[token]:
        user_info_dict[token]['premium'] += premium
    else:
        user_info_dict[token]['premium'] = premium

    return label, '$%0.2f' % price


user_info_dict = dict()


@app.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/initialize/', methods=["GET", "POST"])
def initialize_chatbot():
    token = str(uuid.uuid1())
    # get intro from lex
    response = lex_client.put_session(
        botName="SpecialtyInsuranceBot",
        botAlias="Bot",
        userId=token,
        dialogAction={
            "type": "ElicitIntent",
            "message": "intro message",
            "messageFormat": "PlainText"
        }
    )
    intro = response['message']
    user_info_dict[token] = dict()
    return jsonify(message=intro, token=token)


@app.route('/post-chatbot', methods=['POST', 'GET'])
def post_chatbot():
    data = request.get_json()
    message = data['message']
    token = data['token']
    response = lex_client.post_text(
        botName="SpecialtyInsuranceBot",
        botAlias="Bot",
        userId=token,
        inputText=message
    )
    print(response)
    response_message = response['message']
    # assuming ('info_name', info)
    extracted_info = ('duration', '13')
    user_info_dict[token][extracted_info[0]] = extracted_info[1]
    # get response from AWS
    return jsonify(message=response_message)


@app.route('/post-image')
def post_image():
    data = request.get_json()
    image = data['image']
    token = data['token']
    label, value = get_info(image, token)
    return "We value your %s at %s. Is that correct?" % (label, value)


socketio.run(app)
