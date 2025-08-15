const path = require("path");

/** @type {import('@rspack/core').Configuration[]} */
module.exports = [
  // ESM build
  {
    name: "esm",
    mode: "production",
    target: ["web", "es2022"],
    entry: {
      pyret: "./src/pyret.ts",
      api: "./src/api.ts",
      "default-rpcs": "./src/default-rpcs.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      library: { type: "module" },
    },
    experiments: {
      outputModule: true,
    },
    devtool: "source-map",
    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        fs: require.resolve("@zenfs/core"),
        path: require.resolve("path-browserify"),
        process: require.resolve("process/browser"),
      },
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: { syntax: "typescript" },
                  target: "es2022",
                },
              },
            },
          ],
        },
      ],
    },
  },
  // CJS build
  {
    name: "cjs",
    mode: "production",
    target: ["web", "es2022"],
    entry: {
      pyret: "./src/pyret.ts",
      api: "./src/api.ts",
      "default-rpcs": "./src/default-rpcs.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].cjs",
      module: false,
      chunkFormat: "commonjs",
      library: { type: "commonjs2" },
    },
    devtool: "source-map",
    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        fs: false,
        path: false,
        process: false,
      },
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: { syntax: "typescript" },
                  target: "es2022",
                },
              },
            },
          ],
        },
      ],
    },
    externals: {
      fs: "commonjs fs",
      path: "commonjs path",
      process: "commonjs process",
    },
  },
];

