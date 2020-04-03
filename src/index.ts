import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as cors from "cors";
import routes from "./routes/routes";
import * as config from "config";
import * as fs from "fs";
//var ca = [fs.readFileSync(__dirname + "/cert.pem")];

createConnection()
  .then(async connection => {
    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(morgan("short"));
    app.use(express.json());

    app.use("/", routes);

    if (app.get("env") === "production") {
      app.use(function(req, res, next) {
        var protocol = req.get("x-forwarded-proto");
        protocol == "https"
          ? next()
          : res.redirect("https://" + req.hostname + req.url);
      });
    }

    const port = config.get("server.port");

    app.listen(port, () => {
      console.log("Server started on port " + port);
    });
  })
  .catch(error => console.log(error));
