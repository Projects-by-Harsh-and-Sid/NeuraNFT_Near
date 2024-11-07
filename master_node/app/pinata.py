
import requests
from app import app


PINATA_API_KEY = app.config['PINATA_API_KEY'] 
PINATA_SECRET_KEY = app.config['PINATA_SECRET_KEY']
PINATA_JWT =   app.config['PINATA_JWT']

PINATA_ENDPOINT = 'https://uploads.pinata.cloud/v3/files'

PINATA_ENDPOINTS = {
    'upload': 'https://uploads.pinata.cloud/v3/files',
    'get_file': 'https://api.pinata.cloud/v3/files/',
    'sign_url': 'https://api.pinata.cloud/v3/files/sign'
}

def upload_to_pinata(file):
    """Upload file to Pinata"""
    headers = {
        'Authorization': f'Bearer {PINATA_JWT}'
    }
    
    files = {
        'file': file
    }
    
    try:
        response = requests.post(
            PINATA_ENDPOINTS['upload'],
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Upload failed: {response.text}")
            
    except Exception as e:
        raise Exception(f"Error: {str(e)}")
    
def sign_url(pinata_url, expires=500000):
    """Get signed URL for file access"""
    headers = {
        'Authorization': f'Bearer {PINATA_JWT}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'url': pinata_url,
        'expires': expires,
        'date': 1724875300,  # You might want to generate this dynamically
        'method': 'GET'
    }
    
    try:
        response = requests.post(
            PINATA_ENDPOINTS['sign_url'],
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to sign URL: {response.text}")
            
    except Exception as e:
        raise Exception(f"Error: {str(e)}")
    
def get_file_info(file_id):
    """Get file information from Pinata"""
    headers = {
        'Authorization': f'Bearer {PINATA_JWT}'
    }
    
    try:
        response = requests.get(
            f"{PINATA_ENDPOINTS['get_file']}{file_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get file info: {response.text}")
            
    except Exception as e:
        raise Exception(f"Error: {str(e)}")