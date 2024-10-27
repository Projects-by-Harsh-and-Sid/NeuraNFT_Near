const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    http: false,
    https: false,
    util: false,
    buffer: false,
    url: false,
    assert: false,
    os: false,
    process: require.resolve('process/browser')  // Add this line
  };

  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ];

  // Add this rule to handle fully specified module imports
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
}