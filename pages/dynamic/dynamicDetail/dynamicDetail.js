const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0,
    count: 0,
    pageNumber: 1,
    inputValue: '',
    handleType: '',
    newsDetail: [],
    commentList: [],
    getFocus: false,
    lock: false,
    isAuthor: false,
    autoFocus: false,
    showAgreement: false,
    orderImg: app.img.orderImg,
    noHeadImg: app.img.noHeadImg,
    fullStar: app.img.fullStar,
    fullLike: app.img.fullLike,
    memberImg:app.img.memberImg,
    banImg: "/images/public/found_icon_de_in_su@2x.png",
    likeImg: "/images/dynamic/like@2x.png",
    collectImg: "/images/dynamic/found_coll@2x.png",
    dynamicImg: "/images/dynamic/share@2x.png",

    editImg: "/images/dynamic/found_icon_de_co@3x.png",
    selfShareImg: "/images/dynamic/myself_icon_tr@2x.png",

    reportImg: "/images/public/found_icon_de_j_s@2x.png",
    reported: "/images/public/found_icon_de_j_d@2x.png",
    deleteImg: "/images/public/found_icon_de_j_de@2x.png",

    tipsText: '评论越多，身材越棒哦~',
    actions1: [
      { name: '垃圾广告' },
      { name: '欺诈（酒托、话费托等骗钱行为）' },
      { name: '诽谤辱骂', } // icon: 'share', openType: 'share'
    ],
  },

  /**
   * 生命周期函数--监听页面加载  // : 0, longitude: 0,
   */
  onLoad: function (o) {
    app.common.navTitle("动态详情")
    // if (options.handleType && options.handleType == 'delete') {
    //   this.setData({ handleType: options.handleType })
    // } else {
    //   this.setData({ handleType: 'report' })
    // }
    this.setData({ forumNumber: o.forumNumber, uNumber: o.uNumber, latitude: app.cityInfo.latitude, longitude: app.cityInfo.longitude })
    this.getNewsDetail() //获取帖子详情
    this.getCommentList()  //获取帖子评论列表
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  //获取帖子详情  
  getNewsDetail() {

    let data = {
      lon: this.data.longitude,
      lat: this.data.latitude,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //forumId: this.data.forumId,
      forumNumber: this.data.forumNumber,
    }
    console.log(data)
    app.wxApi.wxPost("api-tribune/fourm/getOneForum", data)
      .then(res => {
        console.log("获取帖子详情", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          this.data.authorNumber = res.data.data.userNumber //存下作者userNumber
          //this.getCommentList()
          let isAuthor = false
          let imgList = res.data.data.mediaList
          //let typeText = ''

          //let imgSrc = ''
          let headImg = res.data.data.headImg
          //if (headImg) imgSrc = app.common.judgeType(headImg)
          if (!headImg) headImg = app.img.noHeadImg
          res.data.data.headImg = headImg

          if (imgList.length > 0) {
            for (let i = 0; i < imgList.length; i++) {
              let url = ''
              if (imgList[i].url) url = imgList[i].url
              if (imgList[i].firstImg) url = imgList[i].firstImg
              if (url) url = app.common.judgeType(url)  //判断是图片、还是视频

              imgList[i].faceImg = imgList[i].url
            }
            res.data.data.mediaList = imgList;
          }
          this.data.forumId = res.data.data.forumId
          res.data.data.distance = Number(res.data.data.distance).toFixed(1)
          if (res.data.data.userNumber == app.userMsg.userNumber) isAuthor = true
          // if (imgList[0].status == 1) typeText = "图片"
          // if (imgList[0].status == 2) typeText = "视频"
          this.setData({
            newsDetail: res.data.data,
            isAuthor: isAuthor,
            shareTitle: '【发现-图片】' + res.data.data.context,
            shareImg: imgList[0].faceImg
          })

        }
      })
  },

  //关注发布人
  about(e) {
    console.log(e)
    //let newsDetail = this.data.newsDetail;
    let userNumber = this.data.uNumber;
    let about = e.currentTarget.dataset.about;
    let data = {
      launchUser: app.userMsg.userNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      acceptUser: userNumber,
    }
    if (userNumber == app.userMsg.userNumber){
      app.Toast.Toast({ content: "不能关注自己" })
      return false 
    }
    console.log(data)
    app.common.aboutOther(app, data, about, "newsDetail", this);
  },
  // 对帖子进行点赞
  likeNews(e) {
    console.log(e)
    let islike = e.currentTarget.dataset.islike
    let data = {
      forumId: this.data.newsDetail.forumId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    if (islike == 1) {
      app.Toast.Toast({ content: "已经点过赞了" })
      return false
    }
    app.wxApi.wxPost("api-tribune/fourm/addPraise", data)
      .then(res => {
        console.log("对帖子进行点赞结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          this.data.newsDetail.isPraise = 1  
          this.data.newsDetail.praise += 1  
          this.setData({ newsDetail: this.data.newsDetail })
        }
      })
  },
  //收藏帖子
  collectNews(e) {
    let _this = this
    //let num = e.currentTarget.dataset.num
    let user = this.data.uNumber
    let collect = e.currentTarget.dataset.collect //为1已收藏，为0未收藏
    let data = {
      collectUserNumber: user,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      passiveCollect: this.data.forumNumber, //1帖子、2课程、3视频编号
      collectType: 1,
    }
    app.common.collect(app, data, collect, this);
  },
  //跳转转发页面
  toForward() {
    app.common.storage('forumDetail', [])
    app.common.storage('forumDetail', this.data.newsDetail)
    if (this.data.newsDetail){
      wx.navigateTo({
        url: '/pages/dynamic/forward/forward',
      })
    }else{
      app.Toast.Toast({ contennt : "获取转发内容失败" })
      return false
    }
  },
  //获取帖子评论列表
  getCommentList() {
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      forumNumber: this.data.forumNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //userNumber: 474660732064108544
    }
    console.log(data)
    app.wxApi.wxPost("api-tribune/comment/getCommentList", data)
      .then(res => {
        console.log("获取帖子评论列表", res)
        if (res.statusCode == 200 && res.data.code ==1) {
          let array = this.data.commentList
          let list = res.data.data.dataList
          if (list.length == 0 || list == null) this.setData({ noCommentData: true })
          if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].commentTime = list[i].commentTime.substring(0, 10)
              if (list[i].hfPage) {
                let answer = list[i].hfPage.dataList
                for (let j = 0; j < answer.length; j++) {
                  if (this.data.authorNumber == answer[j].userNumber) answer[j].nickName += "（作者）"
                }
              }
              array.push(list[i])
            }
          }
          this.setData({ commentList: array,count: res.data.data.count })
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
    if (!_this.data.lock) {
      if (isLike == 1) {
        app.Toast.Toast({ content: "你已点过赞" })
        return false
      }
      _this.setData({ lock: true })
      app.wxApi.wxPost("api-tribune/comment/commentPraise", data)
        .then(res => {
          _this.setData({ lock: false })
          console.log("帖子评论点赞结果", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            app.Toast.Toast({ content: "点赞成功" })
            for (let i = 0; i < list.length; i++) {
              if (cid == list[i].commentId) {
                list[i].isPraise = 1
                list[i].commentPraise++
                _this.setData({ commentList: list })
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
    if (isreport == 1) {
      app.Toast.Toast({ content: "已经举报过了" })
      return false
    }
    app.wxApi.wxPost("api-tribune/comment/commentReport", data)
      .then(res => {
        console.log("帖子评论举报", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          app.Toast.Toast({ content: "举报成功" })
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
  // 输入框单击
  tapEvent(){
    this.data.cid = 0
    this.setData({ getFocus: true, tipsText: "评论越多，身材越棒哦~" })
  },
  //输入框获取焦点
  // focusEvent(){
    
  // },
  //输入框失去焦点
  blurEvent() {
    this.setData({ getFocus: false, })
  },
  // 获取数去狂内容
  checkCont(e) {
    this.setData({ inputValue: e.detail.value })
  },
  // 对评论进行回复  
  answerComment(e){
    console.log(e)
    let cid = e.currentTarget.dataset.cid;
    let name = e.currentTarget.dataset.name;
    let tipsText = "@" + name; 
    this.setData({ autoFocus: true, getFocus: true, cid: cid, tipsText: tipsText })
  },
  //回复页面跳转
  answerPage(e) {
    let commentId = e.currentTarget.dataset.cid
    wx.navigateTo({
      url: '/pages/found/answer/answer?commentId=' + commentId + "&forumNumber=" + this.data.forumNumber,
    })
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  //发布评论、回复
  submitComment() {
    console.log("发布评论")
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
    console.log("评论或回复参数",data)
    if (lock) return false
    app.common.submitComment(app, data, "comment", this)
  },
  // 显示发帖协议提示
  lookAgreement(e){
    let status = e.currentTarget.dataset.status
    if(status == 'open'){
      this.setData({ showAgreement: true })
    }else{
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
  previewImage() {
    let array = []
    let news = this.data.newsDetail
    let data = this.data.newsDetail.mediaList
    if (news.childForum && news.childForum.mediaList) data = news.childForum.mediaList
    if (!data || data == null || data.length == 0) {
      return false
    } else {
      for (let i = 0; i < data.length; i++) {
        if (data[i].url) array.push(data[i].url)
      }
      wx.previewImage({
        urls: array,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      count:0,
      pageNumber:1,
      commentList: []
    })
    this.getNewsDetail() //获取帖子详情
    this.getCommentList()  //获取帖子评论列表
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.commentList.length
    if (count > length){
      this.data.pageNumber ++ 
      this.getCommentList()  //获取帖子评论列表
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,  //,
      path: '/pages/index/userLogin/userLogin',
      imageUrl: this.data.shareImg  
    }
  },
  //帖子举报  this.data.forumId
  reportNews(e) {
    console.log("举报帖子", e)
    let report = e.currentTarget.dataset.report
    //this.data.reportForum = e.currentTarget.dataset.num
    if (report == 1) {
      app.Toast.Toast({ content: "已经举报过了" })
      return false
    } else {
      this.setData({ showReport: true })
      // wx.showModal({
      //   title: '',
      //   content: '确定举报该帖子吗？',
      //   success: function (res) {
      //     console.log(res)
      //     if (res.confirm) {

      //     }
      //   }
      // })
    }
  },
  //取消、选择举报类型
  handleAction(e) {
    console.log("选择举报类型", e)
    let tapType = e.type
    if (tapType == 'cancel') {
      this.setData({ showReport: false })
    }
    if (tapType == 'click') {
      let index = e.detail.index
      this.setData({ reportText: this.data.actions1[index].name, showModal: true })
    }
  },
  //确定/取消，举报弹框
  handleClose(e) {
    console.log(e)
    let tapType = e.type
    let detail = this.data.newsDetail
    let data = {
      //forumId: this.data.forumId,
      forumNumber: this.data.newsDetail.forumNumber,
      reportText: this.data.reportText,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log("举报帖子参数", data)
    this.setData({ showModal: false, showReport: false })
    if (tapType == 'ok') {
      //app.Toast.Toast({ content: "举报成功" })
      //return false
      app.wxApi.wxPost("api-tribune/fourm/reportForum", data)
        .then(res => {
          console.log("举报结果", res)
          app.Toast.Toast({ content: res.data.msg })
          if (res.statusCode == 200 && res.data.code == 1) {
            detail.isReport = 1
            this.setData({ newsDetail: detail })
          }
        })
    }
  },
  //删除帖子
  deleteNews(e) {
    console.log("删除帖子", e)
    let that = this
    //let id = e.currentTarget.dataset.id
    // this.setData({ showDelete: true })
    let data = {
      forumId: this.data.newsDetail.forumId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log(data)
    wx.showModal({
      title: '',
      content: '确定删除该帖子吗？',
      success: function (res) {
        console.log(res)
        if (res.confirm) {
          app.wxApi.wxPost("api-tribune/fourm/delForum", data)
            .then(res => {
              console.log("帖子删除结果", res)
              app.Toast.Toast({ content: res.data.msg })
              if (res.statusCode == 200 && res.data.code == 1) {
                //that.onPullDownRefresh(false)
                //刷新发现页面数据
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];   //上一个页面---发现首页
                prevPage.onPullDownRefresh(false)

                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 500)
              }
            })
        }
      }
    })
  },
})