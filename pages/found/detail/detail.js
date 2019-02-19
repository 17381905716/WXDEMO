const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    newsDetail: [], //帖子详情
    recommendList: [], //热门推荐列表
    commentList: [],
    inputValue:'',
    shareTitle: '',
    shareImg: '',
    handleType: '',
    showAgreement: false,
    faceShow: true,
    isAuthor: false,
    autoFocus: false,
    noCommentData: false,
    disable: false,
    lock: false,
    showReport: false,
    showModal: false,
    cid: 0,
    //newsId: 0,
    orderImg: app.img.orderImg,
    noHeadImg: app.img.noHeadImg,
    playBtn: app.img.playBtn,
    fullStar:app.img.fullStar,
    halfStar: app.img.halfStar,
    fullLike: app.img.fullLike,
    halfLike: app.img.halfLike,
    noDataImg1: app.img.noDataImg1, //矩形大图
    noDataImg2: app.img.noDataImg2, //方形小图
    banImg: "/images/public/found_icon_de_in_su@2x.png",
    reportImg: "/images/public/found_icon_de_j_s@2x.png",
    reported: "/images/public/found_icon_de_j_d@2x.png",
    deleteImg: "/images/public/found_icon_de_j_de@2x.png",
    actions1: [
      { name: '垃圾广告' },
      { name: '欺诈（酒托、话费托等骗钱行为）'},
      { name: '诽谤辱骂', } // icon: 'share', openType: 'share'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    app.common.navTitle("动态详情");

    this.data.forumNumber = options.forumNumber
    this.data.uNumber = options.uNumber
    if (options.handleType && options.handleType == 'delete'){
      this.setData({ handleType: options.handleType })
    } else{
      this.setData({ handleType: 'report' })
    }

  },
  //帖子举报  this.data.forumId
  reportNews(e){
    let report = e.currentTarget.dataset.report
    if (report == 1){
      app.Toast.Toast({ content : "已经举报过了" })
      return false
    }else{
      this.setData({ showReport: true })
    }
  },
  //删除帖子
  deleteNews(){
    this.setData({ showDelete: true })
  },
  // 对帖子进行点赞
  likeNews(e){
    console.log(e)
    let islike = e.currentTarget.dataset.islike
    let data = {
      forumId: this.data.forumId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    if (islike == 1){
      $Toast({ content: "已经点过赞了" })
      return false
    }
    app.wxApi.wxPost("api-tribune/fourm/addPraise", data)
      .then(res => {
        console.log("对帖子进行点赞结果", res) 
        $Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          this.data.newsDetail.isPraise = 1
          this.setData({ newsDetail: this.data.newsDetail })
        }
      })
  },
  //收藏帖子
  collectNews(e) {
    let _this = this
    //let num = e.currentTarget.dataset.num
    let user = e.currentTarget.dataset.user
    let collect = e.currentTarget.dataset.collect //为1已收藏，为0未收藏
    let data = {
      collectUserNumber: user,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      passiveCollect: this.data.forumNumber, //1帖子、2课程、3视频编号
      collectType: 1,
    }
    app.common.collect(app, data, collect, this );
  },
  //关注发布人
  about(e) {
    let newsDetail = this.data.newsDetail;
    let userNumber = this.data.uNumber;
    let about = e.currentTarget.dataset.about;
    let data = {
      launchUser: app.userMsg.userNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      acceptUser: userNumber,
    }
    app.common.aboutOther(app, data, about, "newsDetail", this );
  },
  //获取帖子详情
  getNewsDetail() {
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //forumId: this.data.forumId,
      forumNumber: this.data.forumNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/getOneForum", data)
      .then(res => {
        console.log("获取帖子详情", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          this.data.authorNumber = res.data.data.userNumber //存下作者userNumber
          this.getCommentList()
          let isAuthor = false
          let imgList = res.data.data.mediaList
          let typeText = ''

          //let imgSrc = ''
          let headImg = res.data.data.headImg
          //if (headImg) imgSrc = app.common.judgeType(headImg)
          if (!headImg) headImg = app.img.noHeadImg
          res.data.data.headImg = headImg
          
          if (imgList.length > 0){
            for (let i = 0; i < imgList.length; i++){
              let url = ''
              if (imgList[i].url) url = imgList[i].url
              if (imgList[i].firstImg) url = imgList[i].firstImg
              if (url) url = app.common.judgeType(url)  //判断是图片、还是视频

              imgList[i].faceImg = imgList[i].url
            }
            res.data.data.mediaList = imgList;
          }
          this.data.forumId = res.data.data.forumId
          if (res.data.data.userNumber == app.userMsg.userNumber) isAuthor = true
          if (imgList[0].status == 1) typeText = "图片"
          if (imgList[0].status == 2) typeText = "视频"
          this.setData({ 
            newsDetail: res.data.data, 
            isAuthor: isAuthor,
            shareTitle: '【发现-' + typeText+'】' + res.data.data.context,
            shareImg: imgList[0].faceImg
          })
          
        }
      })
  },
  //获取热门推荐列表
  hotRecommendList(){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-tribune/fourm/getHotList", data)
      .then(res => {
        console.log("查询热门推荐", res)
        if (res.statusCode == 200 && res.data.data.length > 0) {
          let recommend = res.data.data
          for (let i = 0; i < recommend.length;i++){
            let url = ''
            if (recommend[i].mediaList[0].url) url = recommend[i].mediaList[0].url
            if (recommend[i].mediaList[0].firstImg) url = recommend[i].mediaList[0].firstImg
            if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
            recommend[i].faceImg = url 
            recommend[i].createTime = recommend[i].createTime.substring(0,10)
          }
          this.setData({ recommendList: recommend})
        }
      })
  },
  //获取帖子评论列表
  getCommentList() {
    let data = {
      pageNum:1,
      pageSize:10,
      forumNumber: this.data.forumNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //userNumber: 474660732064108544
    }
    console.log(data)
    app.wxApi.wxPost("api-tribune/comment/getCommentList", data)
      .then(res => {
        console.log("获取帖子评论列表", res)
        if (res.statusCode == 200) {
          let list = res.data.data.dataList
          if (list.length == 0 || list == null) this.setData({ noCommentData: true })
          if (list.length > 0)
          {
            for (let i = 0; i < list.length; i++)
            {
              list[i].commentTime = list[i].commentTime.substring(0,10)
              if (list[i].hfPage){
                let answer = list[i].hfPage.dataList
                for(let j = 0;j < answer.length; j++){
                  if (this.data.authorNumber == answer[j].userNumber) answer[j].nickName += "（作者）"
                }
              }
            }
          }
          this.setData({ commentList: list })
        }
      })
  },
  //帖子评论点赞
  commentary(e) {
    let _this = this
    let isLike = e.currentTarget.dataset.islike
    let cid = e.currentTarget.dataset.cid
    let list = _this.data.commentList
    let data = {
      commentId: cid,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    if(!_this.data.lock){
      if (isLike == 1) {
        app.common.showToast("你已点过赞", "success")
        return false
      }
      _this.setData({ lock: true })
      app.wxApi.wxPost("api-tribune/comment/commentPraise", data)
        .then(res => {
          _this.setData({lock:false})
          console.log("帖子评论点赞结果", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            app.common.showToast("点赞成功","success")
            for (let i = 0; i < list.length; i++ ){
              if (cid == list[i].commentId){
                list[i].isPraise = 1
                list[i].commentPraise ++
                _this.setData({ commentList: list})
                break;
              }
            }
          }
        })
    }
  },
  //帖子评论举报
  commentReport(e) {
    let _this = this
    let list = _this.data.commentList
    let cid = e.currentTarget.dataset.cid
    let isreport = e.currentTarget.dataset.isreport
    let data = {
      commentId: cid,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    if (isreport == 1){
      $Toast({ content : "已经举报过了"})
      return false
    }
    app.wxApi.wxPost("api-tribune/comment/commentReport", data)
      .then(res => {
        console.log("帖子评论举报", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          $Toast({ content: "举报成功" })
          for (let i = 0; i < list.length; i++) {
            if (cid == list[i].commentId) {
              list[i].isReport = 1
              _this.setData({ commentList: list })
              break;
            }
          }
        }
      })
  },
  //input失去焦点，重置
  tapEvent(e){
    this.data.cid = 0
    app.common.checkProhibit(app, this)
  },
  // 给input输入框，设置获取焦点
  inputGetFocus(e){
    this.setData({
      cid: e.currentTarget.dataset.cid,
    })
    app.common.checkProhibit(app,this)
  },
  checkCont(e){
    let value = e.detail.value
    this.setData({ inputValue: value })
  },

  //发布评论
  submitComment() {
    let lock = this.data.lock
    let value = this.data.inputValue
    let cid = this.data.cid
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      commentContext: value,
      forumNumber: this.data.forumNumber,
    }
    //判断是对评论进行回复，还是对帖子进行评论
    if (cid > 0) data.parentId = cid
    if (lock) return false
    app.common.submitComment(app, data, "comment", this)
  },

  onShareAppMessage: function (res) {
    return {
      title: this.data.shareTitle,  //,
      path: '/pages/index/index',
      imageUrl: this.data.shareImg//'http://jsf-file.wenqi.xin/img/f32e2079bc854f5eb71e8bab0283c49c.png',
    }
  },
  //查看其他人资料
  lookOtherPage(e){
    app.common.lookOther(app, e) // 查看其他人
  },
  //帖子视频播放
  playPostVideo(e){
    let notetype = e.currentTarget.dataset.notetype
    console.log(notetype)
    if (notetype == 2){
      this.setData({ faceShow: false, videoShow:true})
    }
  },
  
  //跳转评论页面
  commentPage(){
    wx.navigateTo({
      url: '/pages/found/comment/comment?forumNumber=' + this.data.forumNumber + "&forumId=" + this.data.forumId +"&authorNumber="+ this.data.authorNumber,
    })
  },
  //回复页面跳转
  answerPage(e){
    let commentId = e.currentTarget.dataset.cid
    wx.navigateTo({
      url: '/pages/found/answer/answer?commentId=' + commentId + "&forumNumber=" + this.data.forumNumber,
    })
  },
  /**
  * 查看热门推荐，帖子详情
  */
  lookNewsDetail(e){
    this.data.forumNumber = e.currentTarget.dataset.fnum
    this.data.uNumber = e.currentTarget.dataset.unum
    this.setData({
      newsDetail: [], 
      recommendList: [], 
      commentList: [],
      inputValue: '',
      isAuthor: false,
      autoFocus: false,
      noCommentData: false,
      cid: 0,
    })
    //回到顶部
    wx.pageScrollTo({
      scrollTop: 0
    })
    this.onShow()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.hotRecommendList()
    this.getNewsDetail()
    //this.getCommentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //显示/隐藏发帖协议
  lookAgreement(e) {
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
  //预览大图片
  previewImage(){
    let array = []
    let data = this.data.newsDetail.mediaList
    if (!data || data == null || data.length==0){
      return false
    }else{
      for (let i = 0; i < data.length; i++){
        if (data[i].url) array.push(data[i].url)
      }
      wx.previewImage({
        urls: array,
      })
    }
  },
  //取消、选择举报类型
  handleAction(e){
    console.log(e)
    let tapType = e.type
    if (tapType == 'cancel'){
      this.setData({ showReport: false })
    }
    if (tapType == 'click') {
      let index = e.detail.index
      this.setData({ reportText: this.data.actions1[index].name, showModal: true })
    }
  },
  //确定/取消，举报弹框
  handleClose(e){
    console.log(e)
    let tapType = e.type
    let detail = this.data.newsDetail
    let data = {
      //forumId: this.data.forumId,
      forumNumber: this.data.forumNumber,
      reportText: this.data.reportText,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log("举报帖子参数",data)
    this.setData({ showModal: false, showReport: false })
    if (tapType == 'ok'){
      //app.Toast.Toast({ content: "举报成功" })
      //return false
      app.wxApi.wxPost("api-tribune/fourm/reportForum", data)
      .then(res => {
        console.log("举报结果",res)
        app.Toast.Toast({ content: res.data.msg })
        if(res.statusCode == 200 && res.data.code==1){
          app.Toast.Toast({ content: res.data.msg })
          detail.isReport = 1
          this.setData({ newsDetail: detail })
        }
      })
    }
  },
  //确定/取消,确定删除
  deleteClose(e) {
    console.log(e)
    let tapType = e.type
    let data = {
      forumId: this.data.forumId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    this.setData({ showDelete: false })
    if (tapType == 'ok') {
      app.wxApi.wxPost("api-tribune/fourm/delForum", data)
      .then(res => {
        console.log("帖子删除结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {

          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];   //上一个页面
          //刷新发现页面数据
          prevPage.onPullDownRefresh(false)

          setTimeout(()=>{
            wx.navigateBack({
              delta:1
            })
          },500)
        }
      })
    }
  },
  /**
  * 生命周期函数--监听页面显示 
  */
  onShow: function () {
    this.hotRecommendList()
    this.getNewsDetail()
  },
})