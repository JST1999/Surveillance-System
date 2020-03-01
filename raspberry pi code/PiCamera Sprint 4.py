import picamera
import RPi.GPIO as gpio
import requests
import json

gpio.setwarnings(False)#now the pi ignores them

gpio.setmode(gpio.BOARD)
gpio.setup(11,gpio.IN)
gpio.setup(13,gpio.OUT)

camera = picamera.PiCamera()
camera.vflip = True#it is flipped by default so this flips it back
camera.hflip = True

file = open("number.txt", 'r+')
i = int(file.read())#used to give each pic its own unique name
file.close()


#this section is the login section
url = "https://surv-system.herokuapp.com/adminlogin"
sessionID = ""
while True:
    username = input("Username:")
    password = input("Password:")
    
    data = {
        "username":username,
        "password":password
    }
    
    try:
        r = requests.post(url, data=data)
    except:
        print("Network error: server or your connection may be down")
    status = r.status_code
    if status == 200:
        json = r.json()
        sessionID = json["message"]
        print("Got session. Now running")
        break
    elif status == 401:
        print("Invalid login credentials")
    else:
        print("Something went wrong, try again")


#this section is the one that checks the IR sensor and takes a picture, also post reqs it
url = "https://surv-system.herokuapp.com/addimage"
while True:
    if gpio.input(11) == True:#can be one, if ir sensor sends a signal it will be 1/true
        gpio.output(13, True)#led on
        
        name = sessionID + "%s.jpg" % i#e.g. image0.jpg, image1.jpg
        
        camera.capture(name)#saved into the same directory. If an image.jpg already exists, then it will be overwritten
        
        files = {"imgUploader": open(name, 'rb')}
        requests.post(url, files=files)#post req
        
        i += 1
        file = open("number.txt", 'w')#the w method will overwrite the previous value, whereas r+ doesn't
        file.write(str(i))#non-volatile storage of what image number I'm on
        file.close()#saves changes
    else:
        gpio.output(13, False)#led off
    
gpio.cleanup()