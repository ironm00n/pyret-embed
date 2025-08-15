{
  description = "A modern library for embedding Pyret into webpages with Next.js 14+ support";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      nixpkgs,
      systems,
      treefmt-nix,
    }:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (s: f (import nixpkgs { system = s; }));
      treefmtEval = eachSystem (pkgs: treefmt-nix.lib.evalModule pkgs ./nix/treefmt.nix);
    in
    {
      formatter = eachSystem (pkgs: treefmtEval.${pkgs.system}.config.build.wrapper);

      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
          ];

          shellHook = ''
            echo "Pyret Embed Development Environment"
            echo "Node.js: $(node --version)"
            echo "npm: $(npm --version)"
            echo "TypeScript: $(npx tsc --version)"
            echo ""
            echo "Available commands:"
            echo "  npm install    - Install dependencies"
            echo "  npm run build  - Build the package"
            echo "  npm run dev    - Build in watch mode"
            echo "  npm run clean  - Clean build artifacts"
            echo "  npm run format - Format code with Prettier"
            echo "  npm run lint   - Lint code with ESLint"
            echo "  treefmt        - Format code with treefmt"
          '';
        };
      });

      packages = eachSystem (pkgs: {
        default = pkgs.stdenv.mkDerivation {
          pname = "pyret-embed";
          version = "0.0.1-pre.0";
          src = ./.;

          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
          ];

          buildPhase = ''
            npm ci --production=false
            npm run build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist $out/
            cp package.json $out/
            cp README.md $out/
          '';

          meta = with pkgs.lib; {
            description = "A modern library for embedding Pyret into webpages with Next.js 14+ support";
            homepage = "https://github.com/brownplt/pyret-embed";
            license = licenses.isc;
            platforms = platforms.all;
          };
        };
      });
    };
}
