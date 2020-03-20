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


url = "http://localhost:8080/addvideo"#video mode
#url = "http://surv-system.herokuapp.com/addimage"#image mode
sessID = "e7c70f5e89fcc0068081c052f08606fd34b9068f9b81a44dd84377e1a2812f21"

files = {"vidUploader": open(sessID+"0.mp4", "rb")}#video mode, vidUploader

requests.post(url, files=files)
