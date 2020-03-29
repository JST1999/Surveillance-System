import picamera
import RPi.GPIO as gpio
import requests
import json
from os import system

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


#this section is the login section, with pre-entered login details
def login_from_sign_up(username, password):
    url = "https://surv-system.herokuapp.com/adminlogin"
    while True:
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
    file = open("numberVideo.txt", 'w')#these 3 set the txt to 0
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


def sign_up():
    url = "https://surv-system.herokuapp.com/signup"
    while True:
        email = input("Email:")
        password = input("Password:")
        conPassword = input("Confirm Password:")
        firstname = input("Firstname:")
        lastname = input("Lastname:")
        username = input("Username:")
        
        if len(email) == 0 or len(password) == 0 or len(conPassword) == 0 or len(firstname) == 0 or len(lastname) == 0 or len(username) == 0:
            print("Some inputs are empty")
        else:
            if password != conPassword:
                print("Passwords don't match")
            else:
                print("Creating...")
                
                data = {
                    "firstname":firstname,
                    "lastname":lastname,
                    "email":email,
                    "password":password,
                    "username":username
                }
                
                try:
                    r = requests.post(url, data=data)
                except:
                    print("Network error: server or your connection may be down")
                status = r.status_code
                if status == 200:
                    print("Account created")
                    return login_from_sign_up(username, password)
                elif status == 401:
                    print("Invalid login credentials")
                else:
                    print("Something went wrong, try again")


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


def main_video(sessionID):
    print("Now running...")
    
    file = open("numberVideo.txt", 'r+')
    i = int(file.read())#used to give each pic its own unique name
    file.close()
    
    camera.resolution = (480, 360)
    
    url = "https://surv-system.herokuapp.com/addvideo"
    while True:
        if gpio.input(11) == True:#can be one, if ir sensor sends a signal it will be 1/true
            gpio.output(13, True)#led on
            
            name = sessionID + "%s.h264" % i#e.g. video0.h264
            mp4Name = sessionID + "%s.mp4" % i
            
            camera.start_recording(name)
            
            while gpio.input(11):#if true, the loop will run
                pass#do nothing, pass is used to help satisfy syntax
            
            camera.stop_recording()
            
            gpio.output(13, False)#led off
            
            command = "MP4Box -add " + name + " " + mp4Name#converts h264 to mp4
            system(command)#unix cmd
            
            files = {"vidUploader": open(mp4Name, 'rb')}
            requests.post(url, files=files)#post req
            
            i += 1
            file = open("numberVideo.txt", 'w')#the w method will overwrite the previous value, whereas r+ doesn't
            file.write(str(i))#non-volatile storage of what image number I'm on
            file.close()#saves changes
        
    gpio.cleanup()


def main_video_offline():
    print("Now running...")
    
    file = open("numberVideoOffline.txt", 'r+')
    i = int(file.read())#used to give each pic its own unique name
    file.close()
    
    camera.resolution = (480, 360)
    
    while True:
        if gpio.input(11) == True:#can be one, if ir sensor sends a signal it will be 1/true
            gpio.output(13, True)#led on
            
            name = "video" + "%s.h264" % i#e.g. video0.h264
            
            camera.start_recording(name)
            
            while gpio.input(11):#if true, the loop will run
                pass#do nothing, pass is used to help satisfy syntax
            
            camera.stop_recording()
            
            gpio.output(13, False)#led off
            
            i += 1
            file = open("numberVideoOffline.txt", 'w')#the w method will overwrite the previous value, whereas r+ doesn't
            file.write(str(i))#non-volatile storage of what image number I'm on
            file.close()#saves changes
        
    gpio.cleanup()


#video or image mode decider
def image_mode():
    while True:
        imgOrVid = input("0 for image | 1 for video:")
        if imgOrVid == "0":
            return True
        elif imgOrVid == "1":
            return False
        else:
            print("Invalid input")


while True:
    onOrOff = input("0 for offline | 1 for online:")
    if onOrOff == "0":#as a string, there will be no need for try except in case the value cant be converted to an int e.g. int("a")
        imageMode = image_mode()
        if imageMode == True:
            print("Image mode")
            main_offline()
        else:
            print("Video mode")
            main_video_offline()
    elif onOrOff == "1":
        imageMode = image_mode()
        if imageMode == True:
            print("Image mode")
            if not sessID:#if sessID is empty
                answer = input("No sessionID was found. 0 to login | 1 to create account:")
                if answer == '0':
                    main(login())
                elif answer == '1':
                    main(sign_up())
                else:
                    print("Invalid input")
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
            print("Video mode")
            if not sessID:#if sessID is empty
                answer = input("No sessionID was found. 0 to login | 1 to create account:")
                if answer == '0':
                    main_video(login())
                elif answer == '1':
                    main_video(sign_up())
                else:
                    print("Invalid input")
            else:
                answer = input("SessionID was found. Continue with current session ID(Y or N):")
                answer = answer.upper()
                if answer == 'Y':
                    main_video(sessID)
                elif answer == 'N':
                    logout(sessID)
                    main_video(login())
                else:
                    print("Invalid input")
    else:
        print("Invalid input")
