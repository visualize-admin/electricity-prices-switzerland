import Document, {
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html
        data-app-version={`${process.env.VERSION}`}
        // lang={this.props.locale}
      >
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
