const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo root for pnpm hoisted packages
config.watchFolders = [monorepoRoot];

// Enable package exports for proper ESM resolution during SSR
config.resolver.unstable_enablePackageExports = true;

// Help Metro resolve packages in pnpm monorepo structure
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure all react imports resolve to the same instance (fixes "Invalid hook call" on web)
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

// SVG support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'wasm'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = withUniwindConfig(config, {
  // relative path to your global.css file (from previous step)
  cssEntryFile: './global.css',
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: './uniwind-types.d.ts',
});
