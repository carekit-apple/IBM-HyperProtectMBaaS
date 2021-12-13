/* BackendSDK CareKit Test
  - using 'jest' npm package
  - POST is issued using 'verification.json' file as data
  
  Use command 'npm test' to initiate validation test
*/
const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// setup the cert
const cacert = fs.readFileSync(
  path.resolve(__dirname + "../../src/carekit-root.crt")
);
const httpsAgent = new https.Agent({ ca: cacert });
axios.defaults.httpsAgent = httpsAgent;

const input = require(path.resolve(__dirname + "../../verification.json"));

describe("Testing MBaaS functionality", () => {
  test("Testing POST call to Backend SDK", async () => {
    const res = await axios({
      url: "https://localhost:3000/revisionRecord",
      method: "POST",
      data: input,
    });
    expect(res.data).toEqual("RevisionRecord stored");
  });

  test("Testing GET call to Backend SDK", async () => {
    const res = await axios({
      url: "https://localhost:3000/revisionRecord",
      method: "GET",
      params: {
        knowledgeVector: {
          processes: [{ id: "1C43F648-D41A-4A5A-8708-15737425FA7C", clock: 2 }],
        },
      },
    });
    expect(res.data.entities.length).toEqual(2);
  });
});
