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


#url = "http://localhost:8080/addvideo"#video mode
url = "http://surv-system.herokuapp.com/addvideo"#video mode
sessID = "155fdddcfc4d70e58e3110c50bc8d3cff148e64faea53b59bc73ff332e9a740a"

files = {"vidUploader": open(sessID+"0.mp4", "rb")}#video mode, vidUploader
#files = {"imgUploader": open(sessID+"0.jpg", "rb")}#image mode, imgUploader

requests.post(url, files=files)
