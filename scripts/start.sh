#!/bin/sh

while( true) ; do
	stty -f /dev/cuaU0.init -isig -icanon -iexten -echo -echoe -echok -echoctl -echoke -opost -onlcr ignbrk -brkint -icrnl -imaxbel -crtscts -hup -ixany

	cat /dev/cuaU0 | scripts/sensorssave
	sleep 5
done &

while( true) ; do
	scripts/nodestats.pl
	sleep 5
done &

cd srv
while( true) ; do
	node value.js 2>&1 > /dev/null < /dev/null
	sleep 5
done &
