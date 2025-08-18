{
  description = "Ruby + Bundler developer environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          name = "ruby-dev-shell";

          buildInputs = [
            pkgs.ruby
            pkgs.bundler
            (pkgs.python3.withPackages (ps: with ps; [ notebook ]))
          ];

          shellHook = ''
            echo "Ruby: $(ruby -v)"
            echo "Bundler: $(bundler -v)"
          '';
        };
      });
}
