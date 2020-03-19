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
sessID = "d29eabe218fc3b823f6f49c7128f3b9296f6cb2f84464a868d1dbb39acf2c480"

files = {"vidUploader": open(sessID+"0.mp4", "rb")}#video mode, vidUploader

requests.post(url, files=files)
