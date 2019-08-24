import requests
import base64
r = requests.get("http://localhost:5000/initialize").json()
print(r)
first_msg = requests.get("http://localhost:5000/post-chatbot",
                         json={'message': "I want a quote", "token": r['token']})
print(first_msg.json())
# json={'image': base64.b64encode(image)})
