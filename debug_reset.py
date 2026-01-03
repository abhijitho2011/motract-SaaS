import requests
import time

url = "https://motract-backend-5sct.onrender.com/super-admin/reset-database?key=RESET_ME_NOW"

print("Waiting for deployment... Retrying Reset in loop (Max 5 mins)")

for i in range(10): # 10 * 30s = 5 mins
    try:
        print(f"Attempt {i+1}: Sending DELETE to {url}...")
        response = requests.delete(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("SUCCESS: Database Reset!")
            print(response.text)
            break
        elif response.status_code == 404:
            print("404 Not Found - Deployment pending. Waiting 30s...")
        else:
            print(f"Error {response.status_code}. Waiting 30s...")
            print(response.text)
            
    except Exception as e:
        print(f"Exception: {e}. Waiting 30s...")
    
    time.sleep(30)
