import requests
import json
import codecs

BASE_URL = "https://motract-backend-5sct.onrender.com"

def debug_create():
    url = f"{BASE_URL}/super-admin/organizations"
    
    # Use unique data to avoid "Already Exists" if that's not the issue
    # But user might be hitting "Already Exists".
    # I'll use a random suffix.
    import random
    import time
    # Hardcode previous successful values to force duplicate error
    phone = "9876548268"
    business_name = "Test Workshop 1767455240"
    email = "test_workshop_1767455240_8268@motract.com"
    
    payload = {
        "accountType": "RSA",
        "subCategory": "Puncture Repair, Towing",
        "businessName": business_name,
        "email": email,
        "phone": phone,
        "address": "123 Test St",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "gstin": None,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "isAuthorized": False,
        "createdBy": "debug-script",
        "adminUser": {
            "name": business_name,
            "email": email,
            "password": "password123"
        }
    }
    
    output = []
    output.append(f"Attempting Create Partner at {url}...")
    output.append(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(url, json=payload)
        output.append(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            output.append("\nFULL RESPONSE:")
            output.append(json.dumps(data, indent=2))
        except:
            output.append(f"\nResponse Text: {response.text}")

    except Exception as e:
        output.append(f"Error: {e}")

    with codecs.open("d:/Motract-SaaS/create_debug_output.txt", "w", "utf-8") as f:
        f.write("\n".join(output))
        
if __name__ == "__main__":
    debug_create()
