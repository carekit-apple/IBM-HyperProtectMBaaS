#!/bin/bash
#
# Generates SSL certificates for CareKit

main() {
  # rootCA.key
  openssl genrsa -out HyperProtectBackendSDK/certs/rootCA.key 4096
  # rootCA.crt
  openssl req -x509 -new -nodes -key HyperProtectBackendSDK/certs/rootCA.key -sha256 -days 1024 -out HyperProtectBackendSDK/certs/rootCA.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$1"
  # carekit-sdk.key
  openssl genrsa -out HyperProtectBackendSDK/certs/carekit-sdk.key 2048
  # carekit-sdk.csr
  openssl req -new -sha256 -key HyperProtectBackendSDK/certs/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM_ZaaS/CN=$1" -out HyperProtectBackendSDK/certs/carekit-sdk.csr
  # carekit-sdk.crt
  openssl x509 -req -in HyperProtectBackendSDK/certs/carekit-sdk.csr -CA HyperProtectBackendSDK/certs/rootCA.crt -CAkey HyperProtectBackendSDK/certs/rootCA.key -CAcreateserial -out HyperProtectBackendSDK/certs/carekit-sdk.crt -days 500 -sha256
}

main $1
