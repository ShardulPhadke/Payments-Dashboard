const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
  nx: {
    svgr: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@payment/shared-types': require('path').resolve(__dirname, '../libs/shared-types/src/index.ts'),
    };
    return config;
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);