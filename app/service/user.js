const Service = require('egg').Service;

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
    });
  }
  async createUser(data) {
    // 创建用户

    data.password = this.ctx.helper.md5(data.password);
    const user = new this.User(data);
    await user.save();// 存入数据库
    return user;
  }
}

module.exports = UserService;
