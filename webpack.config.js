const { resolve } = require('path');
const webpack = require('webpack');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');

const packageJSON = require('./package.json');
const packageName = normalizePackageName(packageJSON.name);

const LIB_NAME = pascalCase(packageName);
const PATHS = {
  entryPoint: resolve(__dirname, 'index.ts'),
  umd: resolve(__dirname, 'dist/umd'),
  fesm: resolve(__dirname, 'dist/lib-fesm'),
};
// https://webpack.js.org/configuration/configuration-types/#exporting-a-function-to-use-env
// this is equal to 'webpack --env=dev'
const DEFAULT_ENV = 'dev';

const EXTERNALS = ['jest', 'jest-diff', 'jest-matcher-utils', /^expect\/.*$/, /^rxjs.*$/];

const RULES = {
  ts: {
    test: /\.tsx?$/,
    include: /./,
    use: [
      {
        loader: 'ts-loader',
        options: {
          // we don't want any declaration file in the bundles
          // folder since it wouldn't be of any use ans the source
          // map already include everything for debugging
          // This cannot be set because -> Option 'declarationDir' cannot be specified without specifying option 'declaration'.
          // declaration: false,
        },
      },
    ],
  },
  tsNext: {
    test: /\.tsx?$/,
    include: /./,
    use: [
      {
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            target: 'es2020',
          },
        },
      },
    ],
  },
};

const config = (env = DEFAULT_ENV) => {
  const { ifProd } = getIfUtils(env);
  const PLUGINS = removeEmpty([
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: ifProd('"production"', '"development"') },
    }),
  ]);

  const UMDConfig = {
    mode: ifProd('production', 'development'),
    // These are the entry point of our library. We tell webpack to use
    // the name we assign later, when creating the bundle. We also use
    // the name to filter the second entry point for applying code
    // minification via UglifyJS
    entry: {
      [ifProd(`${packageName}.min`, packageName)]: [PATHS.entryPoint],
    },
    // The output defines how and where we want the bundles. The special
    // value `[name]` in `filename` tell Webpack to use the name we defined above.
    // We target a UMD and name it MyLib. When including the bundle in the browser
    // it will be accessible at `window.MyLib`
    output: {
      path: PATHS.umd,
      filename: '[name].js',
      libraryTarget: 'umd',
      library: LIB_NAME,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      // libraryExport:  LIB_NAME,
      // will name the AMD module of the UMD build. Otherwise an anonymous define is used.
      umdNamedDefine: true,
    },
    // Add resolve for `tsx` and `ts` files, otherwise Webpack would
    // only look for common JavaScript file extension (.js)
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    // add here all 3rd party libraries that you will use as peerDependncies
    // https://webpack.js.org/guides/author-libraries/#add-externals
    externals: EXTERNALS,
    // Activate source maps for the bundles in order to preserve the original
    // source when the user debugs the application
    devtool: 'source-map',
    plugins: PLUGINS,
    module: {
      rules: [RULES.ts],
    },
  };

  const FESMconfig = Object.assign({}, UMDConfig, {
    mode: ifProd('production', 'development'),
    entry: {
      [ifProd('index.min', 'index')]: [PATHS.entryPoint],
    },
    output: {
      path: PATHS.fesm,
      filename: UMDConfig.output.filename,
    },
    module: {
      rules: [RULES.tsNext],
    },
  });

  return [UMDConfig, FESMconfig];
};

module.exports = config;

// helpers

function dashToCamelCase(myStr) {
  return myStr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toUpperCase(myStr) {
  return `${myStr.charAt(0).toUpperCase()}${myStr.substr(1)}`;
}

function pascalCase(myStr) {
  return toUpperCase(dashToCamelCase(myStr));
}

function normalizePackageName(rawPackageName) {
  const scopeEnd = rawPackageName.indexOf('/') + 1;
  return rawPackageName.substring(scopeEnd);
}
