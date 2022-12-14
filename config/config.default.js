/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1665929165832_9047';

  // add your middleware config here
  config.middleware = ['errorHandler'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 配置数据库
  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/youtube-clone',
      options: {
        useUnifiedTopology: true
      },
      // mongoose global plugins, expected a function or an array of function and options
      plugins: []
    }
  };
  // 关闭csrf检测
  config.security = {
    csrf: {
      enable: false
    }
  };
  config.jwt = {
    // 推荐使用UUID
    secret: 'edae016b-2482-46d1-85fd-4793e29d4c30',
    expiresIn: '30d'
  };

  config.cors = {
    origin: '*'
  };

  return {
    ...config,
    ...userConfig
  };
};
