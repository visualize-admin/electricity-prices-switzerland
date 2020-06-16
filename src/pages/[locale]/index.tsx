import { Trans } from "@lingui/macro";
import { Header } from "../../components/header";

export default function IndexPage() {
  return (
    <div>
      <Header></Header>
      <Trans id="test.hello">Hallo</Trans>
    </div>
  );
}
