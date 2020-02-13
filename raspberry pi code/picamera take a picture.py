import picamera
import time
from sys import exit

camera = picamera.PiCamera()
camera.vflip = True#it is flipped by default so this flips it back
camera.capture("example.jpg")#saved into the same directory. If an example.jpg already exists, then it will be overwritten
#you can also specify a file path. ('image%s.jpg' % i), i being an int from a for loop, this will do image0.jpg to image4.jpg

print("Pic taken")
exit()