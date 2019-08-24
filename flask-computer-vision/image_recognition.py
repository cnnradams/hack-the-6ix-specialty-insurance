import boto3
import os
from pathlib import Path
ACCESS_KEY = os.environ['ACCESS_KEY']
SECRET_KEY = os.environ['SECRET_KEY']


class RecognizeImage():
    def __init__(self):
        self.client = boto3.client(
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY,
            region_name='us-west-1',
            service_name='rekognition'
        )

    def classify_image(self, image):
        if not image:
            with open(os.path.abspath('flask-computer-vision/test_img.jpeg'), 'rb') as img:
                image = img.read()
        response = self.client.detect_labels(Image={'Bytes': image})
        if len(response['Labels']) == 0:
            return "Unknown"
        else:
            return response['Labels'][0]['Name']
        pass
