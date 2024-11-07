
import requests
from app import app


PINATA_API_KEY = app.config['PINATA_API_KEY'] 
PINATA_SECRET_KEY = app.config['PINATA_SECRET_KEY']
PINATA_JWT =   app.config['PINATA_JWT']

PINATA_ENDPOINT = 'https://uploads.pinata.cloud/v3/files'



def upload_to_pinata(file, filename):
    """Upload a file to Pinata IPFS using V3 API"""
    headers = {
        'Authorization': f'Bearer {PINATA_JWT}'
    }
    
    # Prepare the file for upload
    files = {
        'file': (filename, file)
    }
    
    try:
        response = requests.post(
            PINATA_ENDPOINT,
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            ipfs_data = response.json()
            # The response includes IpfsHash in the 'ipfs' field
            ipfs_url = f"https://gateway.pinata.cloud/ipfs/{ipfs_data['ipfs']['IpfsHash']}"
            return ipfs_url
        else:
            raise Exception(f"Pinata upload failed: {response.text}")
            
    except Exception as e:
        raise Exception(f"Error uploading to Pinata: {str(e)}")
    