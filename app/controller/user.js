
const { Controller } = require('egg');

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    const body = this.ctx.request.body;
    // 对前端传递的数据校验
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
    // 生成token
    const token = this.service.user.createToken({
      userId: user._id,
    });
    ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }
  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    ctx.validate({
      email: { type: 'email' },
      password: { type: 'string' },
    }, body);
    // 校验邮箱是否存在
    const userService = this.service.user;
    const user = await userService.findByEmail(body.email);
    if (!user) {
      ctx.throw(422, '用户不存在');
    }
    // 校验密码是否正确
    if (ctx.helper.md5(body.password) !== user.password) {
      ctx.throw(422, '密码不正确');
    }
    // 生成token
    const token = this.service.user.createToken({
      userId: user._id,
    });
    ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }
}

module.exports = UserController;
