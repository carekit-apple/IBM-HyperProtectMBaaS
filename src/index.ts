// @ts-ignore
/*
 Copyright (c) 2020, International Business Machines All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1.  Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 2.  Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder(s) nor the names of any contributors
 may be used to endorse or promote products derived from this software without
 specific prior written permission. No license is granted to the trademarks of
 the copyright holders even if such marks are included in this software.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/routes";
import config from "config";
import { createOrIncrementClock } from "./utils";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import { MongoConnectionOptions } from "typeorm/driver/mongodb/MongoConnectionOptions";

dotenv.config();
var options: MongoConnectionOptions;

// check env variable for MONGO_DB value - default is localhost (127.0.0.1)
if (process.env.MONGO_DB === "localhost"){
  options = {
    type: "mongodb",
    database: "carekit",
    entities: [`${__dirname}/entity/**/*`],
    useNewUrlParser: true,
    useUnifiedTopology: true,
    url : "mongodb://localhost:27017/",
  };
} else {
  const ca = [fs.readFileSync(__dirname + "/cert.pem")];
  options = {
    type: "mongodb",
    database: "carekit",
    entities: [`${__dirname}/entity/**/*`],
    useNewUrlParser: true,
    url : process.env.MONGO_DB,
    ssl : true,
    sslCA : ca
  };
}

createConnection(options)
  .then(async (connection) => {
    const app = express();
    app.use(express.json({limit: '4mb'}));
    app.use(express.urlencoded({limit: '4mb'}));
    app.use(cors());
    app.use(helmet());
    app.use(morgan("short"));
    app.use(express.json());

    app.use("/", routes);

    if (app.get("env") === "production") {
      app.use(function (req, res, next) {
        const protocol = req.get("x-forwarded-proto");
        protocol == "https" ? next() : res.redirect("https://" + req.hostname + req.url);
      });
    }

    await createOrIncrementClock(false);

    const port = config.get("server.port");

    app.get("/", function (req, res) {
      res.send("Backend SDK is running");
    });

     const carekit_key = fs.readFileSync(__dirname + '/carekit-sdk.key');
     const carekit_crt = fs.readFileSync(__dirname + '/carekit-sdk.crt');
    
     https.createServer({
      key: carekit_key, cert: carekit_crt,}, app)
      .listen(port, function () {
        console.log('CareKit Backend SDK is running!');
      });
    })
     .catch((error) => console.log(error));
