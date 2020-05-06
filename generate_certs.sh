#!/bin/bash
#
# Generates SSL certificates for CareKit

main() {
  # rootCA.key
  openssl genrsa -out $PWD/certs/rootCA.key 4096
  # rootCA.crt
  openssl req -x509 -new -nodes -key $PWD/certs/rootCA.key -sha256 -days 1024 -out $PWD/certs/rootCA.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$1"
  # carekit-sdk.key
  openssl genrsa -out $PWD/certs/carekit-sdk.key 2048
  # carekit-sdk.csr
  openssl req -new -sha256 -key $PWD/certs/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM_ZaaS/CN=$1" -out $PWD/certs/carekit-sdk.csr
  # carekit-sdk.crt
  openssl x509 -req -in $PWD/certs/carekit-sdk.csr -CA $PWD/certs/rootCA.crt -CAkey $PWD/certs/rootCA.key -CAcreateserial -out $PWD/certs/carekit-sdk.crt -days 500 -sha256
}

main $1 # Pass in localhost to this script
