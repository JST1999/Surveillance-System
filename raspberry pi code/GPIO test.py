import RPi.GPIO as gpio
import time

gpio.setmode(gpio.BOARD)
gpio.setup(11,gpio.OUT)

for i in range(10):
    gpio.output(11,True)
    time.sleep(1)
    gpio.output(11,False)
    time.sleep(1)
    gpio.output(11,True)
    time.sleep(0.5)
    gpio.output(11,False)
    time.sleep(0.5)
    gpio.output(11,True)
    time.sleep(0.5)
    gpio.output(11,False)
    time.sleep(0.5)
    
gpio.cleanup()