import requests

good = 0
for i in range(50):
    test = requests.post("http://127.0.0.1:1337/api/get-concept",
                     json={
                         "userId" : 1,
                     }
    )
    if test.text == "Success":
        good += 1
        print("Success\n")
    else: print(f"{test.text}\n")
print(good)
