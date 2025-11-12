let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs_22;
  yarn = pkgs.yarn.override { inherit nodejs; };
  trivy = pkgs.trivy;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    yarn
    nodejs
    bun
  ];
}
