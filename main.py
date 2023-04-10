import io
import cv2
import numpy as np
from PIL import Image
from flask_cors import CORS
from flask import Flask, request, Response

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type' 
app.config['Access-Control-Allow-Credentials'] = True

CORS(
  app, 
  resources={r"/*": {
    "origins": "*",
    "allow_headers": "*", 
    "expose_headers": "*"
  }},
  supports_credentials=True
)
  
def edge_mask(img, line_size, blur_value):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, blur_value)
    
    return cv2.adaptiveThreshold(
        gray_blur,
        255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        line_size,
        blur_value,
    )
    
def color_quantization(img, k):
    data = np.float32(img).reshape((-1, 3))
    
    criteria = (
      cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 
      20, 0.001
    )
    ret, label, center = cv2.kmeans(
      data, 
      k, 
      None, 
      criteria, 
      10, 
      cv2.KMEANS_RANDOM_CENTERS
    )
    
    center = np.uint8(center)
    result = center[label.flatten()] # type: ignore
    result = result.reshape(img.shape)
    return result
  

@app.route('/api/cartoonize', methods=['POST'])
def cartoonize():
    file = request.files['image']
    image = Image.open(file) # type: ignore
    img_np = np.array(image)
    line_size = 7
    blur_value = 7

    edges = edge_mask(img_np, line_size, blur_value)
    total_color = 9
    img_np = color_quantization(img_np, total_color)

    blurred = cv2.bilateralFilter(
      img_np, 
      d=7, 
      sigmaColor=200, 
      sigmaSpace=200
    )

    cartoon = cv2.bitwise_and(blurred, blurred, mask=edges)

    cartoon = Image.fromarray(cartoon)
    img_byte_arr = io.BytesIO()
    cartoon.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()

    return Response(img_byte_arr, mimetype='image/jpeg')
  
@app.route('/hello')
def hello():
  return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True, port=5000)