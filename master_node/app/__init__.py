
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
app.config['PINATA_API_KEY'] = 'd73ed61684c7102841c2'
app.config['PINATA_SECRET_KEY'] = 'd86656ea55e13d88072f9d8b77d6a9dbf82f19a84e093a0de28b7ac302aa135d'
app.config['PINATA_JWT'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhMGU4NWU4Mi01ZjE4LTRhZWYtODM3My1kMTJhOWNjMWJmNzIiLCJlbWFpbCI6ImhhcnNoLnBvZGRhcjE2MDVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ3M2VkNjE2ODRjNzEwMjg0MWMyIiwic2NvcGVkS2V5U2VjcmV0IjoiZDg2NjU2ZWE1NWUxM2Q4ODA3MmY5ZDhiNzdkNmE5ZGJmODJmMTlhODRlMDkzYTBkZTI4YjdhYzMwMmFhMTM1ZCIsImV4cCI6MTc2MjUwNTM1MX0.HZ5Hu55bxJBL5yPD1dJu_isJ4gXJFmYmsSfwVit4Ax0'








# from app import routes
from app import data_fetch
from app import routesv2
from app import chat_routes
from app import pinata