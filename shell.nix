let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs_22;
  pnpm = pkgs.nodePackages.pnpm;
  trivy = pkgs.trivy;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    pnpm
    nodejs
    bun
  ];
}
