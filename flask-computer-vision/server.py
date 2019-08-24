from flask import Flask
from flask import request
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/get_info', methods=['GET', 'POST'])
def get_info():
    data = request.get_json()
