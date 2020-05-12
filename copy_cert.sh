#!/bin/bash

container=$(docker ps -aqf "name=app")

docker cp $container:/usr/app/carekit-hyperprotect/src/carekit-root.crt $PWD
