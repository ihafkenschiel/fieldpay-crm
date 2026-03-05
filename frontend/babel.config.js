module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@fieldpay/core': './src/core',
            '@fieldpay/ui': './src/ui',
            '@fieldpay/api-client': './src/api',
          },
        },
      ],
    ],
  };
};
