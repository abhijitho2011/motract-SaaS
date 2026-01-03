import requests
import json

url = "https://motract-backend-5sct.onrender.com/super-admin/organizations"

# Data for the missing workshop
payload = {
    "accountType": "WORKSHOP",
    "subCategory": "General Workshop",
    "businessName": "Existing Workshop",
    "email": "test_script_999@motract.com",
    "phone": "9999999999",
    "address": "Test Street",
    "city": "Test City",
    "state": "Test State",
    "pincode": "999999",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "isAuthorized": True,
    "createdBy": "script",
    "adminUser": {
        "name": "Test Partner",
        "email": "test_script_999@motract.com",
        "password": "password123"
    }
}

try:
    print("Attempting to create workshop...")
    response = requests.post(url, json=payload)
    if response.status_code == 201:
        print("Success! Created workshop with phone 9876543210")
        print(response.json())
    else:
        print(f"Failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {str(e)}")
