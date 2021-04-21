let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs-14_x;
  yarn = pkgs.yarn.override { inherit nodejs; };

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    yarn
    nodejs
  ];
}