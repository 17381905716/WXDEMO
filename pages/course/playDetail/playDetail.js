const { $Toast } = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    faceShow : true,
    videoShow: false,
    autoPlayVideo: false,
    noCommentData: false,
    disable: false,
    lock: false,
    showAgreement: false,
    halfStar: app.img.halfStar,
    fullStar: app.img.fullStar,
    halfLike: app.img.halfLike,
    fullLike: app.img.fullLike,
    playImg: app.img.playImg,
    playBtn: app.img.playBtn,
    noDataImg1: app.img.noDataImg1,
    noHeadImg: app.img.noHeadImg,
    orderImg: app.img.orderImg,
    memberImg: app.img.memberImg,
    videoIndex: 'first',
    inputValue: '',
    shareTitle: '',
    shareImg: '',
    videoDetail:[],
    commentList:[],
    autoPlay: "/images/public/course_icon_de_tv_vid_se@3x.png",
    noAutoPlay: "/images/public/course_icon_de_tv_vid_d@3x.png",
    bgImg: "", //http://wx4.sinaimg.cn/mw690/0060lm7Tly1ftgeragy68j30sg0iy762.jpg
    videoUrl: "https://flv2.bn.netease.com/videolib3/1511/19/RiCBl0272/SD/RiCBl0272-mobile.mp4",
    nextList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.data.classNumber = options.classNumber
    if (options.userNumber)this.setData({ userNumber: options.userNumber })
    //this.data.classId = options.classId;
    //this.data.classIndex = options.classIndex
    app.common.navTitle("播放详情");
  },

  /**
   * 视频播放
   */
  playVideo:function(e){
    let id = e.currentTarget.dataset.id
    this.setData({
      faceShow: false,
      videoShow: true,
    })
    this.addVideoPlay(id)
  },
  //设置自动播放后续课程
  autoPlaySet(){
    let autoPlay = false
    if(!this.data.autoPlayVideo){
      autoPlay = true
    }
    this.setData({ autoPlayVideo: autoPlay })
  },
  //获取评论列表
  getCommentList(){
    let data = {
      pageSize: 10,
      pageNum: 1,
      classNumber: this.data.classNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    console.log("评论列表参数",data)
    app.wxApi.wxPost("api-teaching-video/commentvedio/getCommentList", data)
    .then(res => {
      console.log("获取评论列表",res)
      if (res.statusCode == 200 ) {
        let data = res.data.data
        if (data == null || data.dataList.length == 0 ) this.setData({ noCommentData : true}) 
        if (data && data.dataList.length > 0){
          let list = res.data.data.dataList
          for (let i = 0; i < list.length; i++){
            if (list[i].nickName && list[i].nickName.length>15){
              list[i].nickName = list[i].nickName.substring(0,15) + "..."
            }
          }
          this.setData({ commentList: list })
        } 
        console.log(this.data) 
      }
    })
  },
  //获取后续课程
  getNextCourse(){
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      courseNumber: this.data.courseNumber,
      classIndex: Number(this.data.classIndex),
    }
    console.log("获取后续课程参数",data)
    app.wxApi.wxPost("api-teaching-video/courseclass/getRemainClassList",data)
    .then( res => {
      console.log("获取后续课程",res)
      if(res.statusCode == 200 && res.data.data.length >0){
        this.setData({nextList : res.data.data})
      }
    })
  },
  //关注发布人
  about(e){
    console.log("关注",e)
    let videoDetail = this.data.videoDetail;
    let userNumber = e.currentTarget.dataset.usernumber;
    let about = e.currentTarget.dataset.about;
    let data = {
      launchUser: app.userMsg.userNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      acceptUser: userNumber,
    }
    app.common.aboutOther(app, data, about, "videoDetail", this);
  },

  //获取视频播放详情
  getVideoDetail() {
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //classId: this.data.classId,
      classNumber: this.data.classNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courseclass/getClassInfo", data)
      .then(res => {
        console.log("获取视频详情", res)
        if(res.statusCode == 200 && res.data.code == 1){
          let videoDetail = res.data.data.classInfo

          let imgSrc = ''
          let headImg = res.data.data.headImg
          if (headImg) imgSrc = app.common.judgeType(headImg)
          if (!imgSrc) imgSrc = app.img.noHeadImg
          res.data.data.headImg = imgSrc

          this.data.courseNumber = videoDetail.courseNumber
          this.data.classId = videoDetail.classId;
          this.data.classIndex = videoDetail.classIndex
          //this.data.userNumber = videoDetail.classUpdateId
          this.setData({ 
            userNumber: videoDetail.classUpdateId,
            videoDetail: res.data.data,
            bgImg: videoDetail.classHeadUrl,
            videoUrl: videoDetail.classVideoUrl,
            shareImg: videoDetail.classHeadUrl,
            shareTitle: '【热门视频】' + videoDetail.classTitle + '-' + videoDetail.classDescription
          })
        }
        this.getNextCourse()
      })
  },
  //视频播放结束，是否需要自动播放
  playEnd(e){
    let status = this.data.autoPlayVideo;
    let nextList = this.data.nextList
    let index = e.currentTarget.dataset.index
    if (status){
      if (nextList.length>0){
        this.setData({ videoUrl: nextList[0].classVideoUrl, classNumber: nextList[0].classNumber })
        this.setData({ commentList: [], nextList: [], videoIndex: "first" })
        this.getVideoDetail()
        //this.getNextCourse()
        this.getCommentList()
      }
    }else{
      //app.common.showToast("无自动播放")
    }
  },
  //视频点赞 classId
  likeVideo(e) {
    let _this = this
    let videoDetail = _this.data.videoDetail
    let id = e.currentTarget.dataset.id;
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      classId: id,
    }
    console.log(data)
    app.wxApi.wxPost("api-teaching-video/courseclass/classParise", data)
      .then(res => {
        console.log("视频点赞", res)
        //app.Toast.Toast({ content: res.data.msg })
        app.common.showToast(res.data.msg,"success")
        if (res.statusCode == 200 && res.data.code == 1) {
          //点赞成功，刷新数据
          videoDetail.isPraise = 1
          this.setData({ videoDetail: videoDetail })
        }
      })

  },
  //收藏视频
  collectVideo(e) {
    let _this = this
    let videoDetail = _this.data.videoDetail
    let num = e.currentTarget.dataset.num
    let collect = e.currentTarget.dataset.collect //为1已收藏，为0未收藏
    let data = {
      collectUserNumber: this.data.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      passiveCollect: num, //视频、帖子、课程编号
      collectType: 3,
    }
    console.log(data)
    //调用收藏方法
    app.common.collect(app, data, collect, this);
  },
  //评论点赞
  likeComment(e){
    let commentList = this.data.commentList
    let id = e.currentTarget.dataset.id
    let status = e.currentTarget.dataset.status
    let data = {
      commentId: id,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    if (status == 1){
      app.Toast.Toast({ content: "已点过赞了" })
      return false
    }else{
      //调用点赞方法
      app.wxApi.wxPost("api-teaching-video/commentvedio/commentPraise", data)
      .then(res => {
        console.log("评论点赞结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          //更新当前评论列表数据
          if(commentList.length > 0){
            for(let i = 0; i < commentList.length;i++){
              if (id == commentList[i].commentList.commentId){
                commentList[i].isPraise = 1
                commentList[i].commentList.commentPraise ++
                this.setData({ commentList: commentList })
                break;
              }
            }
          }
        }
        //this.setData({ videoData: res.data.data })
      })
    }
  },
  //检测是否禁言
  checkProhibit() {

    //let result = app.common.checkProhibit(app, this)

    let prohibit = app.userMsg.userInfo.isAnExcuse  //1未禁言，2已被禁言
    let dayAnExcuse = app.userMsg.userInfo.dayAnExcuse //禁言天数
    let startAnExcuse = app.userMsg.userInfo.startAnExcuse  //开始禁言时间
    //检测是否被禁言，计算禁言天数
    if (prohibit == 1) this.setData({ disable: false })
    if (prohibit == 2) {
      this.setData({ disable: true, inputValue: '' })
      wx.showModal({
        title: '您被禁言',
        content: '您将于' + dayAnExcuse + '天后解除禁言',
        showCancel: false
      })
      return false
    }
  },
  //发布评论
  submitComment(e){
    let lock = this.data.lock
    let value = this.data.inputValue
    //let value = e.detail.value
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      commentUser: app.userMsg.userNumber,
      commentContext: value,
      classNumber: this.data.classNumber,
    }
    if(value){
      if(lock)return false
      //执行文字审核  api-media/aiCheck/checkText
      this.setData({ lock: true })
      app.wxApi.wxPost("api-media/aiCheck/checkText", {str:value})
      .then(res => {
        this.setData({ lock: false })
        console.log("文字审核结果", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          this.setData({ lock: true })
          app.wxApi.wxPost("api-teaching-video/commentvedio/addComment", data)
          .then(res => {
            if (res.statusCode == 200 ) {
              this.setData({ lock: false })
              if (res.data.code == 1){
                $Toast({ content: res.data.msg })
                this.getCommentList()
                this.setData({ inputValue: '' })
              }
            }
          })
           //文本检测不合格，包含敏感词
        }else{
          $Toast({ content: res.data.msg })
        }
      })
    }else{
      $Toast({ content: "请输入评论内容" })
    }
  },
  //增加视频播放次数
  addVideoPlay(id){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      classNumber: this.data.classNumber,
    }
    console.log(data)
    app.wxApi.wxPost("api-teaching-video/courseclass/classPlay", data)
      .then(res => {
        console.log( res.data.msg )
      })
  },
  checkCont(e) {
    let value = e.detail.value
    this.setData({ inputValue: value })
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  //评论页面
  commentPage(){
    wx.navigateTo({
      url: '/pages/course/comment/comment?classNumber=' + this.data.classNumber,
    })
  },
  // 查看剩余课程
  lookNextVideo(e){
    let id = e.currentTarget.dataset.id
    let vNum = e.currentTarget.dataset.vnum
    let cNum = e.currentTarget.dataset.cnum
    let index = e.currentTarget.dataset.index
    console.log(this.data)
    this.setData({
      faceShow: true,
      videoShow: false,
      autoPlayVideo: false,
      videoIndex: 'first',
      inputValue: '',
      videoDetail: [],
      commentList: [],
      nextList:[],
      courseNumber : cNum,
      classId : id,
      classNumber : vNum,
      classIndex : index,
    })
    
    this.onShow()
    //回到顶部
    wx.pageScrollTo({
      scrollTop: 10,
      duration: 300
    })
  },
  //分享
  onShareAppMessage: function (res) {
    return {
      title: this.data.shareTitle,
      path: '/pages/index/userLogin/userLogin',
      imageUrl: this.data.shareImg,
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.getVideoDetail()
    //this.getNextCourse()
    this.getCommentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //显示/隐藏发帖协议
  lookAgreement(e) {
    console.log(e)
    let status = e.currentTarget.dataset.status
    if (status == 'open') {
      this.setData({ showAgreement: true })
    }
    if (status == 'close') {
      this.setData({ showAgreement: false })
    }
  },
  //查看协议
  agreementPage() {
    wx.navigateTo({
      url: '/pages/found/agreement/agreement',
    })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.getVideoDetail()
    //this.getNextCourse()
    this.getCommentList()
  },
})