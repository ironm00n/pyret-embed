{ ... }:
{
  projectRootFile = "flake.nix";
  settings.global.excludes = [
    "COPYING"
    ".envrc"
    "**/.gitignore"
    "node_modules/"
    "dist/"
    "examples/"
    "*.min.js"
    "*.min.css"
    "*.html"
    "package-lock.json"
    "flake.lock"
  ];
  programs = {
    deadnix.enable = true;
    nixfmt.enable = true;
    mdformat.enable = true;
    prettier.enable = true;
  };
  settings.formatter = {
    prettier.options = [
      "--config"
      (toString ../.prettierrc)
    ];
  };
}
