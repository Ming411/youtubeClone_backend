const Controller = require('egg').Controller;

class VideoController extends Controller {
  async createVideo() {
    const body = this.ctx.request.body;
    const {Video} = this.app.model;
    this.ctx.validate(
      {
        title: {type: 'string'},
        description: {type: 'string'},
        vodVideoId: {type: 'string'},
        cover: {type: 'string'}
      },
      body
    );
    body.user = this.ctx.user._id;
    const video = await new Video(body).save();
    this.ctx.status = 201;
    this.ctx.body = {
      video
    };
  }
}

module.exports = VideoController;
