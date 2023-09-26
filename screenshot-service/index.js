const polka = require("polka");

const { handleScreenshot } = require("./dist/screenshot");

const PORT = process.env.PORT || 3001;

polka()
  .get("/api/screenshot", handleScreenshot)
  .listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Running screenshot-service on http://localhost:${PORT}`);
  });
