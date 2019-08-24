import boto3
import os
from pathlib import Path
import base64
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
        response = self.client.detect_labels(
            Image={'Bytes': image}, MaxLabels=1)
        if len(response['Labels']) == 0:
            return "Unknown"
        else:
            #max_conf = 0
            #ind = -1
            # for i, obj in enumerate(response['Labels'][0]):
            obj = response['Labels'][0]
            name = obj['Name']
            print(response)
            if len(obj['Instances']) == 0:
                x = 0
                y = 0
                width = 0
                height = 0
            else:
                print(obj['Instances'])
                x = obj['Instances'][0]["BoundingBox"]['Left']
                y = obj['Instances'][0]["BoundingBox"]['Top']
                width = obj['Instances'][0]["BoundingBox"]['Width']
                height = obj['Instances'][0]["BoundingBox"]['Height']
            print(name, x, y, width, height)
            return name, x, y, width, height
        pass
