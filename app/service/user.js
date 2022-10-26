const Service = require('egg').Service;
const jwt = require('jsonwebtoken');
class UserService extends Service {
  get User() {
    return this.app.model.User;
  }
  findByUsername(username) {
    // this.User 注意不需要括号
    // 通过定义的模型操作数据库
    return this.User.findOne({
      username,
    });
  }
  findByEmail(email) {
    return this.User.findOne({
      email,
    }).select('+password');
  }
  async createUser(data) {
    // 创建用户
    data.password = this.ctx.helper.md5(data.password);
    const user = new this.User(data);
    await user.save();// 存入数据库
    return user;
  }
  // 生成token的方法
  createToken(data) {
    return jwt.sign(data, this.app.config.jwt.secret, {
      expiresIn: this.app.config.jwt.expiresIn,
    });
  }
  // 验证Token
  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }
  // 更新用户信息
  updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, {
      new: true, // 返回更新之后的数据，默认是返回更新之前的
    });
  }
  // 添加订阅
  async subscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    // 检测是否已经订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await User.findById(channelId);
    // 订阅
    if (!record) {
      await new Subscription({
        user: userId,
        channel: channelId,
      }).save();
      // 更新用户订阅数量
      user.subscribersCount++;
      await user.save();
    }
    // 返回用户信息
    return user;
  }
  /* 取消订阅 */
  async unsubscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    // 检测是否已经订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await User.findById(channelId);
    if (record) {
      // 已订阅就取消
      await record.remove();
      user.subscribersCount--;
      await user.save();
    }
    return user;
  }
}

module.exports = UserService;
