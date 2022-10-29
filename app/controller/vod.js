const {Controller} = require('egg');
class VodController extends Controller {
  async createUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate(
      {
        Title: {type: 'string'},
        FileName: {type: 'string'}
      },
      query
    );
    // 这个id和secret是从控制台中获取
    const vodClient = this.app.vodClient;
    // 获取音/视频上传地址和凭证(后续客户端上传需要)
    this.ctx.body = await vodClient.request('CreateUploadVideo', query, {});
  }
  // 上传凭证超时刷新
  async RefreshUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate(
      {
        videoId: {
          type: 'string'
        }
      },
      query
    );
    const vodClient = this.app.vodClient;
    this.ctx.body = await vodClient.request('RefreshUploadVideo', query, {});
  }
}

module.exports = VodController;
