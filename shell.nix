let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs_26;
  pnpm = pkgs.pnpm_10;
  trivy = pkgs.trivy;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    pnpm
    nodejs
    bun
  ];
}
