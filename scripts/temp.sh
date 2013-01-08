#!/bin/sh

# REQUIRE: postgresql

while( true) ; do
	stty -f /dev/cuaU0.init -isig -icanon -iexten -echo -echoe -echok -echoctl -echoke -opost -onlcr ignbrk -brkint -icrnl -imaxbel -crtscts -hup -ixany

	cat /dev/cuaU0 | /usr/local/bin/sensorssave
	sleep 5
done &

cd /usr/local/www/node/src
while( true) ; do
	node value.js 2>&1 > /dev/null < /dev/null
	sleep 5
done &
