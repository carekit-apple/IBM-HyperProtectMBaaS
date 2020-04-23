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
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as cors from "cors";
import routes from "./routes/routes";
import * as config from "config";
import { createOrIncrementClock } from "./utils";

//import * as fs from "fs";
//const ca = [fs.readFileSync(__dirname + "/cert.pem")];

createConnection()
  .then(async (connection) => {
    const app = express();

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

    await createOrIncrementClock();

    const port = config.get("server.port");

    app.listen(port, () => {
      console.log("Server started on port " + port);
    });
  })
  .catch((error) => console.log(error));
