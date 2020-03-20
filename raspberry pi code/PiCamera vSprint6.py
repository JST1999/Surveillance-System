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
camera.exposure_mode = "sports"#faster shutter speed so less motion blur
camera.resolution = (1920, 1080)#1080p

sessionFile = open("sessionID.txt", 'r+')
sessID = sessionFile.read()#used to give each pic its own unique name
sessionFile.close()


#this section is the login section, it will retrieve a session ID
def login():
    url = "https://surv-system.herokuapp.com/adminlogin"
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
            
            sessionFile = open("sessionID.txt", 'w')#the w method will overwrite the previous value, whereas r+ doesn't
            sessionFile.write(sessionID)#non-volatile storage of session ID
            sessionFile.close()#saves changes
            
            return sessionID
        elif status == 401:
            print("Invalid login credentials")
        else:
            print("Something went wrong, try again")


#logs out a user
def logout(sessionID):
    open("sessionID.txt", 'w').close()#the open('w') opens and deletes everything in the file. close() saves it and closes it
    file = open("number.txt", 'w')#these 3 set the txt to 0
    file.write(str(0))
    file.close()
    
    url = "https://surv-system.herokuapp.com/logout"
    data = {
        "sessionID":sessionID
    }
    try:
        r = requests.post(url, data=data)
        print("Logged-out. Login below:")
    except:
        print("Network error: server or your connection may be down")


#this section is the one that checks the IR sensor and takes a picture, also post reqs it
def main(sessionID):
    print("Now running...")
    
    file = open("number.txt", 'r+')
    i = int(file.read())#used to give each pic its own unique name
    file.close()
    
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


#offline version of main
def main_offline():
    print("Now running...")
    
    file = open("numberOffline.txt", 'r+')
    i = int(file.read())#used to give each pic its own unique name
    file.close()
    
    while True:
        if gpio.input(11) == True:#can be one, if ir sensor sends a signal it will be 1/true
            gpio.output(13, True)#led on
            
            name = "image" + "%s.jpg" % i#e.g. image0.jpg, image1.jpg
            
            camera.capture(name)#saved into the same directory. If an image.jpg already exists, then it will be overwritten
            
            i += 1
            file = open("numberOffline.txt", 'w')#the w method will overwrite the previous value, whereas r+ doesn't
            file.write(str(i))#non-volatile storage of what image number I'm on
            file.close()#saves changes
        else:
            gpio.output(13, False)#led off
        
    gpio.cleanup()


while True:
    onOrOff = input("0 for offline | 1 for online:")
    if onOrOff == "0":#as a string, there will be no need for try except in case the value cant be converted to an int e.g. int("a")
        main_offline()
    elif onOrOff == "1":
        if not sessID:#if sessID is empty
            print("No sessionID was found. Login below:")
            main(login())
        else:
            answer = input("SessionID was found. Continue with current session ID(Y or N):")
            answer = answer.upper()
            if answer == 'Y':
                main(sessID)
            elif answer == 'N':
                logout(sessID)
                main(login())
            else:
                print("Invalid input")
    else:
        print("Invalid input")