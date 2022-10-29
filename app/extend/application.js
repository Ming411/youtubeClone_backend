/* 扩展egg应用实例 */
/* vod 视频点播 */
const RPCClient = require('@alicloud/pop-core').RPCClient;
function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-shanghai'; // 点播服务接入地域
  const client = new RPCClient({
    // 填入AccessKey信息
    accessKeyId,
    accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21'
  });
  return client;
}
let vodClient = null;
module.exports = {
  // 懒访问
  get vodClient() {
    if (!vodClient) {
      // 注意这个函数不能是箭头函数
      vodClient = initVodClient(this.config.vod.accessKeyId, this.config.accessKeySecret);
    }
    return vodClient;
  }
};

// 外界就能通过app.vodClient来获取
