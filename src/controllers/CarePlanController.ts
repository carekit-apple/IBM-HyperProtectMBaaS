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

import { Request, Response } from "express";
import { getMongoRepository, getRepository } from "typeorm";
import { OCKCarePlan } from "../entity/OCKCarePlan";
import * as util from "util";
import { validate } from "class-validator";

class CarePlanController {
  static listAll = async (req: Request, res: Response) => {
    const carePlanRepository = getRepository(OCKCarePlan);
    const carePlans = await carePlanRepository.find();

    //console.log(util.inspect(carePlans, false, null, true /* enable colors */));
    res.send(carePlans);
  };

  static getOneById = async (req: Request, res: Response) => {
    //todo
  };

  static newCarePlan = async (req: Request, res: Response) => {
    const carePlanRepository = getRepository(OCKCarePlan);
    try {
      const carePlan = carePlanRepository.create(req.body);

      await validate(carePlan).then((errors) => {
        if (errors.length > 0) {
          res.status(422).json({ msg: "Invalid JSON Input" });
          return;
        }
      });
      await carePlanRepository.save(carePlan);
    } catch (e) {
      res.status(409).json({ msg: "Error saving care plan" });
      return;
    }

    //If all ok, send 201 response
    res.status(201).json({ msg: "Stored" });
  };

  // Delete all carePlans in the collection
  static deleteCarePlans = async (req: Request, res: Response) => {
    const carePlanRepository = getMongoRepository(OCKCarePlan);
    try {
      await carePlanRepository.deleteMany({});
    } catch (e) {
      res.status(409).send("Does not exist");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("CarePlans deleted");
  };
}

export default CarePlanController;
