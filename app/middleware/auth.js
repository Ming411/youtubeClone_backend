module.exports = (options = { required: true }) => {
  /* 验证是否已登录的中间件 */
  return async (ctx, next) => {
    // 前端传输的Authorization会被自动转成小写a，所以读取应该按小写读
    let token = ctx.headers.authorization;
    token = token ? token.split('Bearer ')[1] : null;

    if (token) {
      // 有token尝试获取用户信息
      try {
        const data = ctx.service.user.verifyToken(token);
        ctx.user = await ctx.model.User.findById(data.userId);
      } catch (err) {
        ctx.throw(401);
      }
    } else if (options.required) {
      // 没有token
      ctx.throw(401);
    }


    // 执行后续中间件
    await next();
  };
};
