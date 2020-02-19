import RPi.GPIO as gpio
from time import sleep

gpio.setwarnings(False)#now the pi ignores them

gpio.setmode(gpio.BOARD)
gpio.setup(11,gpio.IN)
gpio.setup(13,gpio.OUT)

#counter = 0
while True:
    #print(counter, end=" ")#end specifys the end of the string, it is defaulted to \n which gives you a new line
    #print(gpio.input(11))
    #sleep(0.075)
    #counter += 1
    if gpio.input(11) == True:#can be one, if ir sensor sends a signal it will be 1/true
        gpio.output(13, True)#led on
    else:
        gpio.output(13, False)#led off
    
gpio.cleanup()