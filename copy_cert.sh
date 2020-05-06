#!/bin/bash

container=$(docker ps -aqf "name=app")

docker cp $container:/usr/app/carekit-hyperprotect/certs/rootCA.crt ~
