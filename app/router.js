'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth(); // 这样就能获取 验证用户是否登录的中间件
  router.prefix('/api/v1'); // 设置基础路径
  router.post('/users', controller.user.create); // 注册
  router.post('/users/login', controller.user.login); // 登录
  router.get('/user', auth, controller.user.getCurrentUser); // 获取当前用户
  router.patch('/user', auth, controller.user.update); // 更新用户资料

  // 用户订阅
  router.post('/users/:userId/subscribe', auth, controller.user.subscribe);
};
