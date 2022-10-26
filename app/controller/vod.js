const { Controller } = require('egg');

/* vod 视频点播 */
const RPCClient = require('@alicloud/pop-core').RPCClient;
function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-shanghai'; // 点播服务接入地域
  const client = new RPCClient({ // 填入AccessKey信息
    accessKeyId,
    accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21',
  });
  return client;
}

class VodController extends Controller {

  async createUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      Title: { type: 'string' },
      FileName: { type: 'string' },
    }, query);

    // 这个id和secret是从控制台中获取
    const vodClient = initVodClient('<Your AccessKeyId>', '<Your AccessKeySecret>');
    // 获取音/视频上传地址和凭证(后续客户端上传需要)
    this.ctx.body = await vodClient.request('CreateUploadVideo', {
      // Title: 'this is a sample',
      // FileName: 'filename.mp4',
      query,
    }, {});
  }
}

module.exports = VodController;
