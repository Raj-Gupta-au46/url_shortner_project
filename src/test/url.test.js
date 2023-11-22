// const jest = require("jest");
const handleGenerateNewShortURL =
  require("../controllers/urlController").handleGenerateNewShortURL;

// // Generates a short URL for a valid URL provided in the request body

// Generates a short URL for a valid URL provided in the request body
it("should generate a short URL when a valid URL is provided", (done) => {
  const req = {
    body: {
      url: "http://www.example.com",
    },
    get: (headerName) => {
      return headerName;
    },
    ip: "107.0.0.1",
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  handleGenerateNewShortURL(req, res)
    .then(() => {
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: expect.any(String) });

      done(); // Call done to signal that the test is complete
    })
    .catch((error) => {
      done.fail(error); // Call done.fail if there's an error
    });
}, 10000);
