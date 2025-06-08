import requests

good = 0

test = requests.post("http://127.0.0.1:1337/api/register",
                    json={
                        "username" : "testing1",
                        "email" : "matthewmatthewson4@outlook.com",
                        "password" : "password123",
                    }
)
if test.text == "Success":
    good += 1
    print("Success\n")
else: print(f"{test.text}\n")
print(good)
