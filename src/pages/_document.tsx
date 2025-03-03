import Document, { Head, Html, Main, NextScript } from "next/document";

import buildEnv from "src/env/build";

class MyDocument extends Document {
  render() {
    return (
      <Html data-app-version={`${buildEnv.VERSION}`}>
        <Head></Head>
        <body>
          <Main />
          <script noModule src="/static/ie-check.js"></script>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
