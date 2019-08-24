import requests
import base64
with open("flask-computer-vision/test_img.jpeg", "rb") as img:
    image = img.read()
    r = requests.post("http://localhost:5000/get_info",
                      json={'image': base64.b64encode(image)})
    print(r)
