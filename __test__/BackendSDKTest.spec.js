/* BackendSDK CareKit Test
  - using 'jest' npm package
  - POST is issued using 'verification.json' file as data
  
  Use command 'npm run test' to initiate validation test
*/

const fs = require('fs');
const path = require('path');
const request = require('request');
const diff = require('json-diff');

describe("Testing MBaaS functionality", () => {
  test("Testing POST call to Backend SDK", () => {
    // code to test goes here
    const input = require(path.resolve(__dirname + '../../verification.json'));
    const cacert = fs.readFileSync(path.resolve(__dirname + '../../src/carekit-root.crt'));
    const options = {
      url: 'http://localhost:3000/revisionRecord',
      method: 'POST',
      headers: 'Content-Type: application/json',
      body: input,
      json: true,
      ca: cacert
    };

    const output = async (options) => {
      const response = await request.post(options, function(err, res, body) {
        if(err) {
          console.log(`Error: ${err}`);
        };
      });
      return response;
    }
    output(options);
  }),
  test("Testing GET call to Backend SDK", () => {
    // code to test goes here
    const input = require(path.resolve(__dirname + '../../verification.json'));
    const cacert = fs.readFileSync(path.resolve(__dirname + '../../src/carekit-root.crt'));
    const options = {
      url: 'http://localhost:3000/revisionRecord',
      method: 'GET',
      headers: 'Content-Type: application/json',
      body: input,
      json: true,
      ca: cacert
    };

    const output = async (options) => {
      const response = await request.get(options, function(err, res, body) {
        if(err) {
          console.log(`Error: ${err}`);
        };
        // if returned json (i.e values stored in the DB) aren't the same as input JSON
        if (!diff.diff(res, input)){
          return false;
        }
      });
      return response;
    }
    output(options);
  });
});
