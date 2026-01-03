import requests
import json
import codecs

BASE_URL = "https://motract-backend-5sct.onrender.com"

def debug_login():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "mobile": "9999999999",
        "password": "admin123" 
    }
    
    output = []
    output.append(f"Attempting login to {url}...")
    
    try:
        response = requests.post(url, json=payload)
        output.append(f"Login Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            output.append("\nFULL RESPONSE:")
            output.append(json.dumps(data, indent=2))
            
            user = data.get('user', {})
            token = data.get('access_token')
            
            output.append("\nLOGIN SUCCESSFUL (Unexpected)")
            output.append("User Details:")
            output.append(json.dumps(user, indent=2))
            
            role = user.get('role')
            workshopId = user.get('workshopId')
            
            output.append(f"\nRole: {role}")
            output.append(f"WorkshopID: {workshopId}")
            
            # Verify if Org exists via API
            if workshopId:
                org_url = f"{BASE_URL}/super-admin/organizations/{workshopId}"
                # Note: Super Admin API might need Super Admin token?
                # Does this user have rights? Likely not if it's WORKSHOP_ADMIN.
                # But we can try validation endpoint?
                # Or just print that we have an ID that bypassed checks.
                output.append(f"Checking Org: {org_url}")
                
                # Check Public Health check? No.
        else:
            output.append(f"\nLogin Failed. Response: {response.text}")

    except Exception as e:
        output.append(f"Error: {e}")

    with codecs.open("d:/Motract-SaaS/login_debug_output.txt", "w", "utf-8") as f:
        f.write("\n".join(output))
        
if __name__ == "__main__":
    debug_login()
