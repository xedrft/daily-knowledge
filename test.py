import requests

# Create a session to persist cookies
session = requests.Session()

# 1. Register or log in to get the JWT set in a cookie
login_payload = {
    "email": "your@email.com",  # or "username": "yourusername"
    "username": "yourlogin",
    "password": "yourpassword"  # Use the same password for both fields
}

res = session.post("http://127.0.0.1:1337/api/register", json=login_payload)

print("Login response:", res.json())
print("Cookies after login:", session.cookies.get_dict())  # Should include JWT
input("Press Enter to continue...")  # Wait for user input before proceeding

# 2. Now test an authenticated route (cookie automatically included)
res2 = session.get("http://127.0.0.1:1337/api/get-concept")  # or your custom route
print("Protected route response:", res2.json())
