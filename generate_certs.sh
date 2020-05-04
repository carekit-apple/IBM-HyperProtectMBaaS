#!/bin/bash
#
# Generates SSL certificates for CareKit

main() {
  # rootCA.key
  openssl genrsa -out ~/HyperProtectBackendSDK-test/certs/rootCA.key 4096
  # rootCA.crt
  openssl req -x509 -new -nodes -key ~/HyperProtectBackendSDK-test/certs/rootCA.key -sha256 -days 1024 -out ~/HyperProtectBackendSDK-test/certs/rootCA.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$1"
  # carekit-sdk.key
  openssl genrsa -out ~/HyperProtectBackendSDK-test/certs/carekit-sdk.key 2048
  # carekit-sdk.csr
  openssl req -new -sha256 -key ~/HyperProtectBackendSDK-test/certs/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM_ZaaS/CN=$1" -out ~/HyperProtectBackendSDK-test/certs/carekit-sdk.csr
  # carekit-sdk.crt
  openssl x509 -req -in ~/HyperProtectBackendSDK-test/certs/carekit-sdk.csr -CA ~/HyperProtectBackendSDK-test/certs/rootCA.crt -CAkey ~/HyperProtectBackendSDK-test/certs/rootCA.key -CAcreateserial -out ~/HyperProtectBackendSDK-test/certs/carekit-sdk.crt -days 500 -sha256
}

main $1
