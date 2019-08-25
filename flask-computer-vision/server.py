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
from flask_cors import CORS, cross_origin
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
    if not cv2.imwrite(os.path.abspath('flask-computer-vision/public/temp.bmp'), img_np):
        print("huh?")
    return 'temp.bmp'


app = Flask(__name__, static_folder='public', static_url_path='')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'application/json'
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

import random
def get_info(image, token):
    image = base64.b64decode(image)
    print(len(image))
    label, x, y, width, height = imgr.classify_image(image)
    price = valuer.value_label(label)
    duration = 120 #user_info_dict[token]['duration']
    loc = draw_bounding_box(
        image, '%s - estimated price: $%0.2f' % (label, price), 1, x, y, x + width, y + height)
    risk = random.uniform(0.005, 0.1)
    print("price:",price, "risk:",risk, "duration:", duration)
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

@app.after_request
def set_cors_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

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
            "message": "Hello, I am Travis! I can insure your personal property when you are away from home. How can I help you today?",
            "messageFormat": "PlainText"
        }
    )
    intro = response['message']
    user_info_dict[token] = dict()
    return jsonify(message=intro, token=token)


@app.route('/post-chatbot', methods=['POST', 'GET'])
def post_chatbot():
    #data = request.get_json()
    data = request.args#print(request.headers)
    message = data['message']
    token = data['token']
    if message == "Ok":
        return jsonify(message="Your quote is $%0.2f" % user_info_dict[token]["premium"])
    response = lex_client.post_text(
        botName="SpecialtyInsuranceBot",
        botAlias="Bot",
        userId=token,
        inputText=message
    )
    print(response)
    if 'message' in response:
        response_message = response['message']
    else:
        response_message = "Ok, exiting. Have a nice day!"
    # assuming ('info_name', info)
    extracted_info = ('duration', '13')
    user_info_dict[token][extracted_info[0]] = extracted_info[1]
    # get response from AWS
    return jsonify(message=response_message)

post_res = None
@app.route('/get-image', methods=['GET'])
def get_image():
    return post_res
@app.route('/post-image', methods=['GET', 'POST', 'OPTIONS'])
def post_image():
    if request.method == 'OPTIONS':
        return 200
    data = request.get_json(force=True)
    print(request.headers)
    token = data['token']
    image = data['image']
    print(len(image))
    label, value = get_info(image, token)
    global post_res
    post_res = jsonify(message="We value your %s at %s." % (label, value))
    return post_res

socketio.run(app, host='0.0.0.0')
