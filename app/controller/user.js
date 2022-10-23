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
    ctx.validate(
      {
        email: { type: 'email' },
        password: { type: 'string' },
      },
      body
    );
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
  async getCurrentUser() {
    const user = this.ctx.user;
    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }
  async update() {
    const body = this.ctx.request.body;
    this.ctx.validate(
      {
        // 默认情况下都是必填选项
        email: { type: 'email', required: false },
        password: { type: 'string', required: false },
        username: {
          type: 'string',
          required: false,
        },
        channelDescription: {
          type: 'string',
          required: false,
        },
        avatar: {
          type: 'string',
          required: false,
        },
      },
      body
    );
    // 校验用户数据
    const userService = this.service.user;// 获取数据库模型
    if (body.email) {
      // this.ctx.user 是权限中间件验证通过后挂载上的
      if (body.email !== this.ctx.user.email && await userService.findByEmail(body.email)) {
        this.ctx.throw(422, 'email 已存在');
      }
    }
    if (body.username) {
      if (body.username !== this.ctx.user.username && await userService.findByUsername(body.username)) {
        this.ctx.throw(422, 'username 已存在');
      }
    }
    if (body.password) {
      body.password = this.ctx.helper.md5(body.password);
    }
    const user = await userService.updateUser(body);
    this.ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }


  /* 订阅其他用户 */
  async subscribe() {
    const userId = this.ctx.user._id;
    const channelId = this.ctx.params.userId;
    // 不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能订阅自己');
    }
    // 添加订阅
    const user = await this.service.user.subscribe(userId, channelId);
    // 发送响应
    this.ctx.body = {
      ...user.toJSON(),
      isSubscribed: true,
    };
  }
}

module.exports = UserController;
