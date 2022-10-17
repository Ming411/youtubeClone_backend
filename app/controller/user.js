
const { Controller } = require('egg');

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
}

module.exports = UserController;
