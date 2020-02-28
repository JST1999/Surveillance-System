import requests

url = "http://localhost:8080/addimage"

files = {"imgUploader": open("Halo_Infinite.jpg", "rb")}
requests.post(url, files=files)
