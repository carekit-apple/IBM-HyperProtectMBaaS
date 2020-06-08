# IBM Hyper Protect MBaaS

The IBM Hyper Protect Mobile-Backend-as-a-Service (MBaaS) is a mediator between the [IBM Hyper Protect SDK for CareKit](https://github.com/carekit-apple/IBM-HyperProtectSDK) and IBM Hyper Protect DBaaS. It must run on IBM Hyper Protect Virtual Servers to prevent this from becoming the weak link in your topology.

_Note, this is a pre-1.0 release and is still in alpha_

### Roadmap

- [ ] Logging with log4js
- [ ] OAuth2 support with JWT
- [ ] Bi-directional Synchronization of other high level entities (Contact, CarePlan, Patient)
- [ ] Comprehensive integration tests
- [ ] Comprehensive system tests
- [ ] OpenAPI Specification template
- [ ] IBM Cloud Starter Kit support
- [ ] Travis Build Support

## Instructions to build and run

> WORK IN PROGRESS

- Ensure you have a MongoDB instance either on [IBM Cloud via Hyper Protect DBaaS](https://www.ibm.com/cloud/hyper-protect-dbaas) or locally (steps below).
- `npm install` to install dependencies
- `npm start` to run

By default, it hosts on port 3000, and expects MongoDB to be available at the default port : 27017. These can be changed in [config.json](./config/config.json) and [ormconfig.json][./ormconfig.json] respectively.

Database connectivity is provided using Typeorm + the official MongoDB JavaScript client. The database can be changed by switching the metadata on main entities in the the `src/entity/*.ts` to match noSQL (ObjectID, ObjectIDColumn() etc) or Relational (PrimaryGeneratedColumn() etc) and then switching the database name in typeorm. More info:

Type ORM requires database connectivity information either in code or reads from ormconfig.json at the project root by default. For connections involving ssl certs, configuration in code is the only option. 


From the Hyper Protect DBaaS Dashboard, copy the connection url. It will look similar to
`mongodb://dbaasXX.hyperp-dbaas.cloud.ibm.com:XXXX,dbaasYY.hyperp-dbaas.cloud.ibm.com:YYYY,dbaasZZ.hyperp-dbaas.cloud.ibm.com:ZZZZ/admin?replicaSet=replicaSet1`

Note, you will need to save the Username and Password when you create your instance as it will never be visible again. Add the user:pass to the URL above : `mongodb://user:pass@dbaasXX.` and store within the `.env` file as the `MONGO_DB` value. This connection url will be passed automatically to the typeorm createConnection api via env variable. The last necessary step is to download the DBaaS CA cert.pem file from the Cloud Dashboard, which must be saved in the src/ directory. 

```bash
$ cat .env 
MONGO_DB=mongodb://admin:dbaasPassword123@dbaasXX.hyperp-dbaas.cloud.ibm.com:XXXX,dbaasYY.hyperp-dbaas.cloud.ibm.com:YYYY,dbaasZZ.hyperp-dbaas.cloud.ibm.com:ZZZZ/admin?replicaSet=Cluster_1_Example
```

**Note**: If an IBM DBaaS MongoDB connection string will **not** being used, simply set the `MONGO_DB` environmental variable to 'localhost' to utilize mongodb locally. 

Next, the `generate_certs.sh` shell script must be run, which will create all of the necessary SSL keys and certificates in order to build and run this application. One argument is required when running this script, and is dependent on what the  _Common Name_ value needs to be. 

To run locally using `npm start` use: localhost

**Note**: If building the application on a Virtual Server use the public IP address of the HPVS instance in lieu of the'localhost' argument.

```bash
$ sudo ./generate_certs.sh -c localhost
Password:
Generating RSA private key, 4096 bit long modulus
..............................................................................++
........................++
e is 65537 (0x10001)
Generating RSA private key, 2048 bit long modulus
............................................+++
.....................................................+++
e is 65537 (0x10001)
Signature ok
subject=/C=US/ST=NC/O=IBM/CN=localhost
Getting CA Private Key
```

Now that the certificates have been created, the `.env` file has been modified with the proper MongoDB connection string, we are ready to build and run the application. Run the _npm_ commands listed below to finish the build and run the application. 

**Prior** to running the _npm_ commands: If a DBaaS MongoDB connection string is **not** being used and 'localhost' was defined as the env variable , run the following command first:
```bash
docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
```

1. npm install
2. npm start

The output will look similar to this:
```bash
$ npm  install
npm WARN hyper-protect-sdk-backend@0.0.1 No repository field.
npm WARN hyper-protect-sdk-backend@0.0.1 No license field.

audited 735 packages in 1.835s
found 0 vulnerabilities

$ npm start

> hyper-protect-sdk-backend@0.0.1 start /Users/dev/IBM-HyperProtectMBaaS
> set debug=* && ts-node-dev --respawn --transpileOnly ./src/index.ts

Using ts-node version 8.10.1, typescript version 3.8.3
(node:34241) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
UUID : 9DB09908-F6CB-4FBC-B1B7-28BE697FAA96
CareKit Backend SDK is running!
```
<br/>

**Validation**

We can validate that the app is running and configured correctly by simply running the predefined validation test, which uses the 'jest' npm package. If the test was run successfully the `npm start` window will have populated a new entry containing a `201` response. 

To run the test, please use the `npm run test` command in a different terminal window (or tab) as depicted below. Please ensure that the directory in the recently opened terminal window/tab is pointed towards the locally cloned **IBM-HyperProtectMBaaS** repo.

```bash
$ npm run test

> ibm-hyperprotect-mbaas@0.0.1 test /Users/ryley.wharton1ibm.com/Documents/Github/IBM-HyperProtectMBaaS
> jest

(node:13022) ExperimentalWarning: The fs.promises API is experimental
 PASS  __test__/BackendSDKValidationTest.spec.js
  BackendSDK CareKit Function
    ✓ Testing POST calls to Backend SDK (7 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.575 s
Ran all test suites.
```

In the `npm start` window we should see a new line of text similar to: 
```bash
::ffff:127.0.0.1 - POST /revisionRecord HTTP/1.1 201 21 - 197.409 ms
```

**The Backend SDK app is now running!**


## For local-dev:

- Docker
- node.js
- typescript

`docker run -d -p 27017-27019:27017-27019 --name mongodb mongo`

The Swift->TypeScript data-structure converson was performed using: https://app.quicktype.io/. If any of the OCKxxx Classes/Structs/Enums/Protocols change, the changes will need to be reflected in the respective [entity][src/entity/*.ts] files. Out-of-sync structures will not lead to failure but to out-of-sync collection schema's between the iOS Core Data structures and the MongoDB backend. This can be tuned to fail instead.

### Synchronization of data structures:
