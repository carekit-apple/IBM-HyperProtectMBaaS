Instructions to build and run:

* Ensure you have a MongoDB instance either on IBM Cloud via Hyper Protect DBaaS (https://www.ibm.com/cloud/hyper-protect-dbaas) or locally (steps below).
* `npm install` to install dependencies
* `npm start` to run

By default, it hosts on port 3000, and expects MongoDB to be available at the default port : 27017. These can be changed in [config.json][./config/config.json] and [ormconfig.json][./ormconfig.json] respectively.

Database connectivity is provided using Typeorm + the official MongoDB JavaScript client. The database can be changed by switching the metadata on main entities in the the src/entity/*.ts to match noSQL (ObjectID, ObjectIDColumn() etc) or Relational (PrimaryGeneratedColumn() etc) and then switching the database name in typeorm. More info:

For local-dev:

* Docker
* node.js
* typescript

 `docker run -d -p 27017-27019:27017-27019 --name mongodb mongo`

The Swift->TypeScript data-structure converson was performed using: https://app.quicktype.io/. If any of the OCKxxx Classes/Structs/Enums/Protocols change, the changes will need to be reflected in the respective src/entity/*.ts files. Out-of-sync structures will not lead to failure but to out-of-sync collection schema's between the iOS Core Data structures and the MongoDB backend. This can be tuned to fail instead.
