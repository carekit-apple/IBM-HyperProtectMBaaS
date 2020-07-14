/* BackendSDK CareKit Test
  - using 'jest' npm package
  - POST is issued using 'verification.json' file as data
  
  Use command 'npm run test' to initiate validation test
*/

const fs = require('fs');
const path = require('path');
const request = require('request');

describe("BackendSDK CareKit Function", () => {
  test("Testing POST call to Backend SDK", () => {
    // code to test goes here
    const input = require(path.resolve(__dirname + '../../verification.json'));
    const cacert = fs.readFileSync(path.resolve(__dirname + '../../src/carekit-root.crt'));
    const options = {
      url: 'https://localhost:3000/revisionRecord',
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
  });
});
