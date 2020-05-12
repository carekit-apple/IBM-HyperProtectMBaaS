#!/bin/bash
#
# Generates SSL certificates for CareKit

main() {
# Create keys and certs
  openssl genrsa -out $PWD/carekit-root.key 4096
  openssl req -x509 -new -nodes -key $PWD/carekit-root.key -sha256 -days 1024 -out $PWD/carekit-root.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$1"
  openssl genrsa -out $PWD/carekit-sdk.key 2048
  openssl req -new -sha256 -key $PWD/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM/CN=$1" -out $PWD/carekit-sdk.csr
  openssl x509 -req -in $PWD/carekit-sdk.csr -CA $PWD/carekit-root.crt -CAkey $PWD/carekit-root.key -CAcreateserial -out $PWD/carekit-sdk.crt -days 500 -sha256

# Comment the below cp command if this is a local setup!
  cp carekit* $PWD/$2/src/

# moving certificates to src directory for app
  mv carekit* $PWD/src/
}

main $1 $2
