{
  description = "Development environment from IxT";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };

        in {
          devShells.default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs_22
              pkgs.nodejs_22.pkgs.pnpm
            ];

            shellHook = ''
              clear >$(tty)
              export PS1="\[\033[0;92m\]\W \$ \[\033[0m\]"
              echo ""
              echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
              echo "┃                                               ┃"
              echo "┃  Welcome to the IxT development environment!  ┃"
              echo "┃                                               ┃"
              echo "┃  Development Server:   'yarn dev'             ┃"
              echo "┃  Start Storybook:      'yarn storybook'       ┃"
              echo "┃                                               ┃"
              echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
              echo ""
            '';
          };

        }
      );
}
