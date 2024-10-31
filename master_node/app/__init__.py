
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.config import init_config 
# get environment variables
from random import randint

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
CONTRACT_FOLDER = 'contract_data_folder'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

RANDOM_KEY = randint(100000000000000, 99999999999999999)

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'chatwithme')

MASTER_API_KEY = os.environ.get('MASTER_API_KEY', '1234567890')
# MASTER_API_KEY = os.environ.get('MASTER_API_KEY', str(RANDOM_KEY))


temp_file_path = os.path.join(os.path.dirname(__file__), 'temp')



# # CHAT_URL = os.environ.get('CHAT_URL', 'http://localhost:8000/query')
# CHAT_URL = os.environ.get('CHAT_URL', 'http://192.168.0.246:8000/query')
# app.config["Load_balancer_Endpoints"] = {
#     "hpcEndpoint": "https://near.backend.neuranft.com",
#     "hpcEndpointPort": "443",
# }

# app.config["filestorage_endpoint"] = "https://near.backend.neuranft.com"

# app.config["NEAR_API_ENDPOINT"] = "http://near_neuranft_near_api_container:3000/api/"

# # app.config["Load_balancer_Endpoints"] = {
# #     "hpcEndpoint": "http://localhost",
# #     "hpcEndpointPort": "6010",
# # }

# # app.config["filestorage_endpoint"] = "http://localhost:6010"

config = init_config()

# Update app configuration
app.config.update(config)


app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER)
app.config['SECRET_KEY'] = SECRET_KEY

app.config['MASTER_API_KEY'] = MASTER_API_KEY
app.config['ALLOWED_EXTENSIONS'] = ALLOWED_EXTENSIONS
app.config['API_KEYS'] = {}
app.config['CHAT_SESSIONS'] = {}
app.config['TEMP_FILE_PATH'] = temp_file_path
app.config['CONTRACT_FOLDER'] = os.path.join(os.path.dirname(__file__), CONTRACT_FOLDER)









# from app import routes
from app import data_fetch
from app import routesv2
from app import chat_routes