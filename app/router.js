'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {router, controller} = app;
  const auth = app.middleware.auth(); // 这样就能获取 验证用户是否登录的中间件
  router.prefix('/api/v1'); // 设置基础路径
  router.post('/users', controller.user.create); // 注册
  router.post('/users/login', controller.user.login); // 登录
  router.get('/user', auth, controller.user.getCurrentUser); // 获取当前用户
  router.patch('/user', auth, controller.user.update); // 更新用户资料
  router.get('/user/:userId', app.middleware.auth({required: false}), controller.user.getUser); // 查询用户资料

  // 用户订阅
  router.post('/users/:userId/subscribe', auth, controller.user.subscribe);
  router.delete('/users/:userId/subscribe', auth, controller.user.unsubscribe);
  router.get('/users/:userId/subscriptions', controller.user.getSubscriptions);

  // 阿里云VOD
  router.get('/vod/CreateUploadVideo', auth, controller.vod.createUploadVideo);
  router.get('/vod/RefreshUploadVideo', auth, controller.vod.RefreshUploadVideo);

  // 创建视频
  router.post('/videos', auth, controller.video.createVideo);
  // 获取视频详情
  router.get('/videos/:videoId', app.middleware.auth({required: false}), controller.video.getVideo);
  // 获取视频列表
  router.get('/videos', controller.video.getVideos);
  // 获取用户发布的视频列表
  router.get('/users/:userId/videos', controller.video.getUserVideos);
  // 获取用户关注的视频列表
  router.get('/users/videos/feed', auth, controller.video.getUserFeedVideos);
  // 更新视频
  router.patch('/videos/:videoId', auth, controller.video.updateVideo);
  // 删除视频
  router.delete('/videos/:videoId', auth, controller.video.deleteVideo);
  // 添加评论
  router.post('/videos/:videoId/comments', auth, controller.video.createComment);
  // 获取评论列表
  router.get('/videos/:videoId/comments', controller.video.getVideoComments);
  // 删除评论
  router.delete('/videos/:videoId/comments/:commentId', auth, controller.video.deleteVideoComment);

  // 喜欢视频 // 取消喜欢就是再次调用
  router.post('/videos/:videoId/like', auth, controller.video.likeVideo);
  // 不喜欢
  router.post('/videos/:videoId/dislike', auth, controller.video.dislikeVideo);
  // 获取用户喜欢的视频列表
  router.get('/user/videos/liked', auth, controller.video.getUserLikedVideos);
};
