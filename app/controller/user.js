
const { Controller } = require('egg');

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    const body = this.ctx.request.body;
    // 前端数据校验
    ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' },
    });
    if (await this.service.user.findByUsername(body.username)) {
      // 判断用户是否存在
      ctx.throw(422, '用户已存在');
    }
    if (await this.service.user.findByEmail(body.email)) {
      ctx.throw(422, '邮箱已存在');
    }
    const user = await this.service.user.createUser(body);
    ctx.body = {
      user: {
        email: user.email,
        // token:
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }
}

module.exports = UserController;
