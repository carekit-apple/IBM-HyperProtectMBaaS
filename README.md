## Instructions to build and run

- Ensure you have a MongoDB instance either on [IBM Cloud via Hyper Protect DBaaS](https://www.ibm.com/cloud/hyper-protect-dbaas) or locally (steps below).
- `npm install` to install dependencies
- `npm start` to run

By default, it hosts on port 3000, and expects MongoDB to be available at the default port : 27017. These can be changed in [config.json](./config/config.json) and [ormconfig.json][./ormconfig.json] respectively.

Database connectivity is provided using Typeorm + the official MongoDB JavaScript client. The database can be changed by switching the metadata on main entities in the the `src/entity/*.ts` to match noSQL (ObjectID, ObjectIDColumn() etc) or Relational (PrimaryGeneratedColumn() etc) and then switching the database name in typeorm. More info:

Type ORM requires database connectivity information either in code or reads from ormconfig.json at the project root by default. For connections involving ssl certs, configuration in code is the only option.

From the Hyper Protect DBaaS Dashboard, copy the connection url. It will look similar to
`mongodb://dbaasXX.hyperp-dbaas.cloud.ibm.com:XXXX,dbaasYY.hyperp-dbaas.cloud.ibm.com:YYYY,dbaasZZ.hyperp-dbaas.cloud.ibm.com:ZZZZ/admin?replicaSet=replicaSet1`

Note, you will need to save the Username and Password when you create your instance as it will never be visible again. Either add the user:pass to the URL above : `mongodb://user:pass@dbaasXX.` or pass it in as a variable to `createConnection()`. The latter is preferred as it can include reading from env variables instead of having credentials in clear-text in code. You will also need to save the ca cert file and consume in the code using

```javascript
const ca = [fs.readFileSync(__dirname + "/cert.pem")];
```

```javascript
createConnection({
  type: "mongodb",
  url:
    "mongodb://dbaasXX.hyperp-dbaas.cloud.ibm.com:XXXX,dbaasYY.hyperp-dbaas.cloud.ibm.com:YYYY,dbaasZZ.hyperp-dbaas.cloud.ibm.com:ZZZZ/admin?replicaSet=replicaSet1",
  database : "carekit",
  username : "",
  password : "",
  ssl: true,
  sslCA: ca,
 entities: [
    `${__dirname}/entity/**/*`,
  ],
}).
```

## For local-dev:

- Docker
- node.js
- typescript

`docker run -d -p 27017-27019:27017-27019 --name mongodb mongo`

The Swift->TypeScript data-structure converson was performed using: https://app.quicktype.io/. If any of the OCKxxx Classes/Structs/Enums/Protocols change, the changes will need to be reflected in the respective [entity][src/entity/*.ts] files. Out-of-sync structures will not lead to failure but to out-of-sync collection schema's between the iOS Core Data structures and the MongoDB backend. This can be tuned to fail instead.

### Synchronization of data structures:

### Useful Mongo Queries:

Delete duplicates (with same uuid):

```javascript
var duplicates = [];

db.getCollection("ock_outcome")
  .aggregate(
    [
      {
        $match: {
          name: { $ne: "" }, // discard selection criteria
        },
      },
      {
        $group: {
          _id: { uuid: "$uuid" }, // can be grouped on multiple properties
          dups: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 }, // Duplicates considered as count greater than one
        },
      },
    ],
    { allowDiskUse: true } // For faster processing if set is larger
  ) // You can display result until this and check duplicates
  .forEach(function (doc) {
    doc.dups.shift(); // First element skipped for deleting
    doc.dups.forEach(function (dupId) {
      duplicates.push(dupId); // Getting all duplicate ids
    });
  });

// If you want to Check all "_id" which you are deleting else print statement not needed
printjson(duplicates);

// Remove all duplicates in one go
db.getCollection("ock_outcome").remove({ _id: { $in: duplicates } });
```

```javascript
db.getCollection("ock_task_copy").update({}, { $pull: { "kv.processes": { id: null } } }, { multi: true });
```
