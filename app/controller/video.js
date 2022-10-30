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
  async getVideo() {
    const {Video, VideoLike, Subscription} = this.app.model;
    const {videoId} = this.ctx.params;
    let video = await Video.findById(videoId).populate(
      'user',
      '_id username avatar subscribesCount'
    );
    if (!video) {
      this.ctx.throw(404, 'video not found');
    }
    video = video.toJSON();
    video.isLiked = false; // 是否喜欢
    video.isDisliked = false;
    video.user.isSubscribed = false;
    if (this.ctx.user) {
      // 用户是否已登录
      const userId = this.ctx.user._id;
      if (await VideoLike.findOne({user: userId, video: videoId, like: 1})) {
        video.isLiked = true;
      }
      if (await VideoLike.findOne({user: userId, video: videoId, like: -1})) {
        video.isDisliked = true;
      }
      if (await Subscription.findOne({user: userId, channel: video.user._id})) {
        video.user.isSubscribed = true;
      }
    }
    this.ctx.body = {
      video
    };
  }
  // 视频列表
  async getVideos() {
    const {Video} = this.app.model;
    let {pageNum = 1, pageSize = 10} = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const getVideos = Video.find()
      .populate('user')
      .sort({
        createAt: -1
      }) // skip 跳过，分页
      .skip(Number.parseInt(pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideosCount = Video.countDocuments(); // 总条数
    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount]);
    this.ctx.body = {
      videos,
      videosCount
    };
  }
  async getUserVideos() {
    const {Video} = this.app.model;
    let {pageNum = 1, pageSize = 10} = this.ctx.query;
    const userId = this.ctx.params.userId;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const getVideos = Video.find({user: userId})
      .populate('user')
      .sort({
        createAt: -1
      })
      .skip(Number.parseInt(pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideosCount = Video.countDocuments({
      user: userId
    }); // 总条数
    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount]);
    this.ctx.body = {
      videos,
      videosCount
    };
  }
  async getUserFeedVideos() {
    const {Video, Subscription} = this.app.model;
    let {pageNum = 1, pageSize = 10} = this.ctx.query;
    const userId = this.ctx.user._id;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    // 查询用户关注的up
    const channels = await Subscription.find({
      user: userId
    }).populate('channel');
    console.log(channels);
    console.log(channels.map(item => item.channel._id));
    const getVideos = Video.find({
      user: {
        $in: channels.map(item => item.channel._id)
      }
    })
      .populate('user')
      .sort({
        createAt: -1
      })
      .skip(Number.parseInt(pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideosCount = Video.countDocuments({
      user: {
        $in: channels.map(item => item.channel._id)
      }
    });
    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount]);
    this.ctx.body = {
      videos,
      videosCount
    };
  }
  async updateVideo() {
    const {body} = this.ctx.request;
    const {videoId} = this.ctx.params;
    const {Video} = this.app.model;
    const userId = this.ctx.user._id;
    // 数据验证
    this.ctx.validate({
      title: {type: 'string', required: false},
      description: {type: 'string', required: false},
      vodVideoId: {type: 'string', required: false},
      cover: {type: 'string', required: false}
    });
    // 查询视频
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'video not found');
    }
    // 只能由视频创建者更新
    if (!video.user.equals(userId)) {
      this.ctx.throw(403); // 403 没有权限
    }
    // 合并更新
    Object.assign(
      video,
      this.ctx.helper._.pick(body, ['title', 'description', 'vodVideoId', 'cover'])
    );
    // 同步数据库
    await video.save();

    this.ctx.body = {video};
  }
  async deleteVideo() {
    const {Video} = this.app.model;
    const {videoId} = this.ctx.params;
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404);
    }
    if (!video.user.equals(this.ctx.user._id)) {
      // 操作者是否为创建者
      this.ctx.throw(403);
    }
    await video.remove();
    this.ctx.status = 204;
  }
  async createComment() {
    const {body} = this.ctx.request;
    const {Video, VideoComment} = this.app.model;
    const {videoId} = this.ctx.params;
    this.ctx.validate(
      {
        content: 'string'
      },
      body
    );
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404);
    }
    // 创建评论
    // 初始化模型数据
    const comment = await new VideoComment({
      content: body.content,
      user: this.ctx.user._id,
      video: videoId
    }).save();
    // 更新视频的评论数量
    video.commentsCount = await VideoComment.countDocuments({
      video: videoId
    });
    await video.save();
    // 映射评论的用户信息
    await comment.populate('user').populate('video').execPopulate();
    this.ctx.body = {
      comment
    };
  }
  async getVideoComments() {
    const {VideoComment} = this.app.model;
    const {videoId} = this.ctx.params;
    let {pageNum = 1, pageSize = 10} = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const getComments = VideoComment.find({video: videoId})
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('user')
      .populate('video');

    const getCommentsCount = VideoComment.countDocuments({video: videoId});

    const [comments, commentsCount] = await Promise.all([getComments, getCommentsCount]);
    this.ctx.body = {
      comments,
      commentsCount
    };
  }
  async deleteVideoComment() {
    const {Video, VideoComment} = this.app.model;
    const {videoId, commentId} = this.ctx.params;
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'video not found');
    }
    const comment = await VideoComment.findById(commentId);
    if (!comment) {
      this.ctx.throw(404, 'comment not found');
    }
    if (!comment.user.equals(this.ctx.user._id)) {
      this.ctx.throw(403);
    }
    // 删除视频
    await comment.remove();
    // 更新评论数量
    video.commentsCount = await Video.countDocuments({
      video: videoId
    });
    await video.save();
    this.ctx.status = 204;
  }
  // 喜欢视频
  async likeVideo() {
    const {Video, VideoLike} = this.app.model;
    const {videoId} = this.ctx.params;
    const userId = this.ctx.user._id;
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'video not found');
    }
    const doc = await VideoLike.findOne({
      user: userId,
      video: videoId
    });
    let isLiked = true;
    // toogle
    if (doc && doc.like === 1) {
      await doc.remove();
      isLiked = false;
    } else if (doc && doc.like === -1) {
      doc.like = 1;
      await doc.save();
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: 1
      }).save();
    }

    // 更新喜欢视频的数量
    video.likesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    });
    // 更新不喜欢视频的数量
    video.dislikesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    });
    // 将数据保存到数据库
    await video.save();
    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked
      }
    };
  }
  async dislikeVideo() {
    const {Video, VideoLike} = this.app.model;
    const {videoId} = this.ctx.params;
    const userId = this.ctx.user._id;
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'video not found');
    }
    const doc = await VideoLike.findOne({
      user: userId,
      video: videoId
    });
    let isLiked = true;
    // toogle
    if (doc && doc.like === -1) {
      await doc.remove();
      isLiked = false;
    } else if (doc && doc.like === 1) {
      doc.like = -1;
      await doc.save();
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: -1
      }).save();
    }

    // 更新喜欢视频的数量
    video.likesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    });
    // 更新不喜欢视频的数量
    video.dislikesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    });
    // 将数据保存到数据库
    await video.save();
    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked
      }
    };
  }
  async getUserLikedVideos() {
    const {Video, VideoLike} = this.app.model;
    let {pageNum = 1, pageSize = 10} = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const filterDoc = {
      user: this.ctx.user._id,
      like: 1
    };
    const likes = await VideoLike.find(filterDoc)
      .sort({
        createAt: -1 // 倒序
      })
      .skip(Number.parseInt(pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideos = Video.find({
      _id: {
        $in: likes.map(item => item.video)
      }
    }).populate('user');
    const getVideosCount = VideoLike.countDocuments();
    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount]);
    this.ctx.body = {
      videos,
      videosCount
    };
  }
}

module.exports = VideoController;
