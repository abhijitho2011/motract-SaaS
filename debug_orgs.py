import requests
import json

url = "https://motract-backend-5sct.onrender.com/super-admin/organizations"

try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(f"Total organizations found: {len(data)}")
        for org in data:
            print(f"Name: {org.get('businessName', 'N/A')}, Phone: {org.get('phone', 'N/A')}, AccountType: '{org.get('accountType', 'N/A')}'")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {str(e)}")
