import requests
import json

##url = "http://localhost:8080/adminlogin"
##
##data = {
##    'username' : "jstungay",
##    'password' : "password"
##}
##
##r = requests.post(url, data=data)
##json = r.json()
##sessionID = json["message"]
##print(sessionID)


url = "http://localhost:8080/addimage"
#url = "http://surv-system.herokuapp.com/addimage"
sessID = "d9542d9a66eebab933764a9f28bea0f67b7e9144a50bdeb80ea0a2a5ed9c849e"

files = {"imgUploader": open(sessID+"0.jpg", "rb")}

requests.post(url, files=files)
