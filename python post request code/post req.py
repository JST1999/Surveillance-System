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

files = {"imgUploader": open("a7fe518213d7b27d1cde683b8d3cef060239792fe62108c931e609d0d24eb4820.jpg", "rb")}

requests.post(url, files=files)
