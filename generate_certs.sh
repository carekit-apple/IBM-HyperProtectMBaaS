#!/bin/bash
#
# Generates SSL certificates for CareKit
​
helpFunction() {      # help function with arg / run instructions
  echo "Usage: "
  echo "$0 -c <CommonName>"
  echo ""
  echo "OR"
  echo "$0 -c <CommonName> -r <RepoName>"
  echo ""
  echo "The 2nd parameter '-r' is only required during an HPVS bootstrap"
  echo "Example of -r: IBM-HyperProtectMBaaS"
  echo ""
  echo "For configuring the BackendSDK locally, use -c localhost. "
  echo "If bootstrapping an HPVS instance, use -c <Public IP for HPVS>"
  echo ""
  echo "Note: You may have to run generate_certs.sh with 'sudo'"
  echo ""
  exit 1
}
​
generateCerts() {
  openssl genrsa -out $PWD/carekit-root.key 4096
  openssl req -x509 -new -nodes -key $PWD/carekit-root.key -sha256 -days 1024 -out $PWD/carekit-root.crt -subj "/C=US/ST=NC/O=IBM/OU=ZaaS/CN=$CN"
  openssl genrsa -out $PWD/carekit-sdk.key 2048
  openssl req -new -sha256 -key $PWD/carekit-sdk.key -subj "/C=US/ST=NC/O=IBM/CN=$CN" -out $PWD/carekit-sdk.csr
  openssl x509 -req -in $PWD/carekit-sdk.csr -CA $PWD/carekit-root.crt -CAkey $PWD/carekit-root.key -CAcreateserial -out $PWD/carekit-sdk.crt -days 500 -sha256
  openssl x509 -in $PWD/carekit-sdk.crt -out $PWD/carekit-sdk.pem
  openssl x509 -outform der -in $PWD/carekit-sdk.pem -out $PWD/carekit-sdk.der
​
  # Logic to copy keys over if script is run on HPVS
  if [ $REPO ]
  then
    cp carekit* $PWD/$REPO/src/
  else
    mv carekit* $PWD/src/
  fi
}
​
####################
# main code block
####################
while getopts "c:r:" opt
do
   case "$opt" in
      c ) CN="$OPTARG" ;;
      r ) REPO="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done
​
if [ -z "$CN" ]
then
   echo "1 mandatory argument is required: -c {CommonName}";
   helpFunction
fi
​
# Generate certificates based on parameters and arguments provided
if [[ $REPO ]]; then
  generateCerts $CN $REPO
else
  generateCerts $CN
fi