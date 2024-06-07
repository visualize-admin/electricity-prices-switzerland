let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs-18_x.override {
    openssl = pkgs.openssl_1_1;
  };
  yarn = pkgs.yarn.override { inherit nodejs; };

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    yarn
    nodejs
  ];
}
