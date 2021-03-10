const polka = require("polka");
const { handleScreenshot } = require("./dist/screenshot");

polka()
  .get("/api/screenshot", handleScreenshot)
  .listen(3001, (err) => {
    if (err) throw err;
    console.log(`> Running on http://localhost:3001`);
  });
