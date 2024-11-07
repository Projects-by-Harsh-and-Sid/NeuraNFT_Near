
from app import app

from flask import request, jsonify, send_from_directory,send_file

from app import blockchain_code

from werkzeug.utils import secure_filename

from web3 import Web3

import random

import string

import json

import os

from io import BytesIO

import requests

from app.pinata import upload_to_pinata

CHAT_URL = app.config['CHAT_URL']
MASTER_API_KEY = app.config['MASTER_API_KEY']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']
PINATA_API_KEY = app.config['PINATA_API_KEY'] 
PINATA_SECRET_KEY = app.config['PINATA_SECRET_KEY']
PINATA_JWT =   app.config['PINATA_JWT']

PINATA_ENDPOINT = 'https://uploads.pinata.cloud/v3/files'


FILE_STORAGE_ENDPOINT = app.config['filestorage_endpoint']

# UPLOAD_FOLDER = 'image'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



    
def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# @app.route('/upload', methods=['POST'])
# def upload_image():
#     if 'image' not in request.files:
#         return 'No image file in the request', 400
    
#     file = request.files['image']
#     if file.filename == '':
#         return 'No selected file', 400
    
#     if file:
#         # Get the file extension
#         _, ext = os.path.splitext(file.filename)
#         # Generate a random filename
#         random_filename = f"{generate_random_string()}{ext}"
#         # Secure the filename
#         filename = secure_filename(random_filename)
#         # Save the file
#         file.save(os.path.join(app.config['UPLOAD_FOLDER'],"images" ,filename))
#         return filename, 200

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return 'No image file in the request', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400
    
    if file:
        # Get the file extension and generate random filename
        _, ext = os.path.splitext(file.filename)
        random_filename = f"{generate_random_string()}{ext}"
        filename = secure_filename(random_filename)
        
        try:
            # Upload to Pinata and get IPFS URL
            ipfs_url = upload_to_pinata(file, filename)
            return ipfs_url, 200
        except Exception as e:
            return str(e), 500
    
# @app.route('/upload_image_url', methods=['POST'])
# def upload_image_url():
#     if 'image' not in request.files:
#         return 'No image file in the request', 400
    
    
#     file = request.files['image']
#     if file.filename == '':
#         return 'No selected file', 400
    
#     if file:
#         # Get the file extension
#         _, ext = os.path.splitext(file.filename)
#         # Generate a random filename
#         random_filename = f"{generate_random_string()}{ext}"
#         # Secure the filename
#         filename = secure_filename(random_filename)
#         # Save the file
#         file.save(os.path.join(app.config['UPLOAD_FOLDER'],"images" ,filename))
#         return f"{FILE_STORAGE_ENDPOINT}/image/{filename}", 200

@app.route('/upload_image_url', methods=['POST'])
def upload_image_url():
    if 'image' not in request.files:
        return 'No image file in the request', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400
    
    if file:
        # Get the file extension and generate random filename
        _, ext = os.path.splitext(file.filename)
        random_filename = f"{generate_random_string()}{ext}"
        filename = secure_filename(random_filename)
        
        try:
            # Upload to Pinata and get IPFS URL
            ipfs_url = upload_to_pinata(file, filename)
            return ipfs_url, 200
        except Exception as e:
            return str(e), 500
    

# @app.route('/image/<filename>')
# def get_image(filename):
    
#     path_to_file = os.path.join(app.config['UPLOAD_FOLDER'],"images")
#     if not os.path.exists(os.path.join(path_to_file, filename)):
#         return send_from_directory(path_to_file, 'default.jpg')
#     print("filename, UPLOAD_FOLDER", filename, UPLOAD_FOLDER)
#     return send_from_directory(path_to_file, filename)
@app.route('/image/<ipfs_hash>')
def get_image(ipfs_hash):
    try:
        # If no hash provided or "default" requested, return default image
        if not ipfs_hash or ipfs_hash == "default":
            default_ipfs_hash = app.config.get('DEFAULT_IMAGE_HASH', 'your-default-image-hash')
            ipfs_hash = default_ipfs_hash
        
        # Construct Pinata gateway URL
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
        
        # Fetch image from Pinata
        response = requests.get(ipfs_url)
        
        if response.status_code == 200:
            # Create a file-like object from the image data
            image_data = BytesIO(response.content)
            
            # Get content type from response headers or default to 'image/jpeg'
            content_type = response.headers.get('Content-Type', 'image/jpeg')
            
            # Return the image with appropriate mime type
            return send_file(
                image_data,
                mimetype=content_type,
                as_attachment=False
            )
        else:
            # If image not found on Pinata, return default image
            default_ipfs_hash = app.config.get('DEFAULT_IMAGE_HASH', 'your-default-image-hash')
            default_url = f"https://gateway.pinata.cloud/ipfs/{default_ipfs_hash}"
            default_response = requests.get(default_url)
            
            if default_response.status_code == 200:
                image_data = BytesIO(default_response.content)
                return send_file(
                    image_data,
                    mimetype=default_response.headers.get('Content-Type', 'image/jpeg'),
                    as_attachment=False
                )
            else:
                return jsonify({"error": "Failed to fetch image from IPFS"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ############################################################################################################
# ################################## Collection Functions ####################################################
# ############################################################################################################

# @app.route('/get_all_collections', methods=['GET'])
# def get_all_collections():
    
#     # curl -X GET http://localhost:5500/get_all_collections
    
#     # path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
#     # if not os.path.exists(path):
#     #     return jsonify({'error': 'No collections found'}), 404
    
#     # with open(path, 'r') as f:
#     #     collections = json.load(f)
    
    
#     return blockchain_code.getAllCollections()
    
    
#     # return jsonify(collections), 200


# @app.route('/get_popular_collections', methods=['GET'])
# def get_popular_collections():
    
#     # curl -X GET http://localhost:5500/get_popular_collections
#     path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_popular_collections.json")
    
#     if not os.path.exists(path):
#         return jsonify({'error': 'No collections found'}), 404
    
#     with open(path, 'r') as f:
#         collections = json.load(f)
        
#     return jsonify( collections), 200


# @app.route('/get_collections_by_address', methods=['GET'])
# def get_collections_by_address():
#     address = request.args.get('address') 
#     if not address:
#         return jsonify({'error': 'Address parameter is required'}), 400
    
#     try:
#         address = Web3.to_checksum_address(str(address).lower())
#     except:
#         return jsonify({'error': 'Invalid address'}), 400

#     return blockchain_code.getAllCollections_by_address(address), 200
    
    
#     # collections_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
#     # if not os.path.exists(collections_path):
#     #     return jsonify({'error': 'Collections data not found'}), 404
    
#     # with open(collections_path, 'r') as f:
#     #     all_collections = json.load(f)
    
#     # my_collections = [collection for collection in all_collections['collections'] if collection['creator'] == address]
#     # # print("my_collections", my_collections)
#     # return jsonify({'myCollections': my_collections}), 200
    


# @app.route('/get_collection_by_id', methods=['GET'])
# def get_collection_by_id():
    
#     collection_id = request.args.get('collection_id')
#     if not collection_id:
#         return jsonify({'error': 'Collection ID parameter is required'}), 400

#     # collections_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
#     # if not os.path.exists(collections_path):
#     #     return jsonify({'error': 'Collections data not found'}), 404
    
#     # with open(collections_path, 'r') as f:
#     #     all_collections = json.load(f)
#     # my_collection = [collection for collection in all_collections['collections'] if collection['id'] == int(collection_id)]
    
    
#     return blockchain_code.get_collection_details_by_id(int(collection_id))
    
        
#     # return jsonify({'myCollections': my_collection}), 200




# ############################################################################################################
# ######################################### NFT Functions ####################################################
# ############################################################################################################

# @app.route('/get_all_nfts', methods=['GET'])
# def get_all_nfts():
#     collection_path = os.path.join(UPLOAD_FOLDER, "temp", "all_nft.json")
#     if not os.path.exists(collection_path):
#         return jsonify({'error': 'Collection not found'}), 404
    
#     with open(collection_path, 'r') as f:
#         nfts = json.load(f)
    
#     return jsonify(nfts), 200




# @app.route('/get_nfts_by_address', methods=['GET'])
# def get_nfts_by_address():
#     # address = request.args.get('address') 
#     # if not address:
#     #     return jsonify({'error': 'Address parameter is required'}), 400

#     # nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
#     # if not os.path.exists(nfts_path):
#     #     return jsonify({'error': 'NFTs data not found'}), 404
    
#     # with open(nfts_path, 'r') as f:
#     #     all_nfts = json.load(f)
    
#     # my_nfts = [nft for nft in all_nfts['nfts'] if nft['owner'] == address]
#     # # print("my_nfts", my_nfts)
#     # return jsonify({'myNFTs': my_nfts}), 200
#     address = request.args.get('address') 
#     if not address:
#         return jsonify({'error': 'Address parameter is required'}), 400

#     try:
#         address = Web3.to_checksum_address(str(address).lower())
#     except:
#         return jsonify({'error': 'Invalid address'}), 400
#     return blockchain_code.all_nfts_own_or_have_access_by_user(address), 200


# # @app.route('/get_nfts_by_address2', methods=['GET'])
# # def get_nfts_by_address2():
# #     address = request.args.get('address') 
# #     if not address:
# #         return jsonify({'error': 'Address parameter is required'}), 400

# #     return blockchain_code.all_nfts_own_or_have_access_by_user(address), 200


# @app.route('/get_nfts_by_collection', methods=['GET'])
# def get_nfts_by_collection():

#     collecton_id = request.args.get('collection_id')
#     if not collecton_id:
#         return jsonify({'error': 'Collection ID parameter is required'}), 400
    
#     all_nfts = blockchain_code.all_nft_of_a_collection(int(collecton_id))
    
#     return all_nfts, 200

#     # collection_address = request.args.get('collection_address')
#     # if not collection_address:
#     #     return jsonify({'error': 'Collection address parameter is required'}), 400

#     # nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
#     # if not os.path.exists(nfts_path):
#     #     return jsonify({'error': 'NFTs data not found'}), 404
    
#     # with open(nfts_path, 'r') as f:
#     #     all_nfts = json.load(f)
    
#     # collection_nfts = [nft for nft in all_nfts['nfts'] if nft['collectionaddress'] == collection_address]
    
#     # return jsonify({'myNFTs': collection_nfts}), 200



# @app.route('/get_nft_by_collectionid_nft_id', methods=['GET'])
# def get_nft_data_by_collectionID_nftID():
    
#     # curl -X GET http://localhost:5500/get_nft_by_collectionid_nft_id?nft_id=1&collection_id=1
    
#     nft_id          = request.args.get('nft_id')
#     collection_id   = request.args.get('collection_id')
        
#     if not nft_id or not collection_id:
#         return jsonify({'error': 'Both NFT ID and Collection address parameters are required'}), 400

#     nft = blockchain_code.nft_of_a_collection_with_access(int(collection_id), int(nft_id))
    
#     return nft, 200




# @app.route('/get_compounded_nft_by_collectionid_nft_id', methods=['GET'])
# def get_nft_data_compounded():
#     nft_id          = request.args.get('nft_id')
#     collection_id   = request.args.get('collection_id')
        
#     if not nft_id or not collection_id:
#         return jsonify({'error': 'Both NFT ID and Collection address parameters are required'}), 400

#     nft = blockchain_code.nft_of_a_collection_with_access(int(collection_id), int(nft_id))
    
#     return nft, 200

#     # nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
#     # if not os.path.exists(nfts_path):
#     #     return jsonify({'error': 'NFTs data not found'}), 404
    
#     # with open(nfts_path, 'r') as f:
#     #     all_nfts = json.load(f)
    
#     # particular_nft = [nft for nft in all_nfts['nfts'] if nft['id'] == int(nft_id) and nft['collectionaddress'] == collection_address]
    
#     # return jsonify({'myNFTs': particular_nft}), 200