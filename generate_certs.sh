#!/bin/bash
#
# Generates SSL certificates for CareKit

main() {
  # rootCA.key
  openssl genrsa -out ~/IBM-HyperProtectMBaaS/certs/rootCA.key 4096
  # rootCA.crt
  openssl req -x509 -new -nodes -key ~/IBM-HyperProtectMBaaS/certs/rootCA.key -sha256 -days 1024 -out ~/IBM-HyperProtectMBaaS/certs/rootCA.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$1"
  # carekit-sdk.key
  openssl genrsa -out ~/IBM-HyperProtectMBaaS/certs/carekit-sdk.key 2048
  # carekit-sdk.csr
  openssl req -new -sha256 -key ~/IBM-HyperProtectMBaaS/certs/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM_ZaaS/CN=$1" -out ~/IBM-HyperProtectMBaaS/certs/carekit-sdk.csr
  # carekit-sdk.crt
  openssl x509 -req -in ~/IBM-HyperProtectMBaaS/certs/carekit-sdk.csr -CA ~/certs/rootCA.crt -CAkey ~/IBM-HyperProtectMBaaS/certs/rootCA.key -CAcreateserial -out ~/IBM-HyperProtectMBaaS/certs/carekit-sdk.crt -days 500 -sha256
}

main $1 # Pass in localhost to this script
