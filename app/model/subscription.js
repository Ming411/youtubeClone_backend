// app/model/subscription.js
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const subscriptionSchema = new Schema({
    user: { // 订阅用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: { // 订阅频道
      type: mongoose.ObjectId,
      ref: 'User', // 链接到User模型，可以通过.populate() 快速查询
      required: true,
    },
    createdAt: { // 创建时间
      type: Date,
      default: Date.now,
    },
    updatedAt: { // 更新时间
      type: Date,
      default: Date.now,
    },
  });

  return mongoose.model('Subscription', subscriptionSchema);
};
