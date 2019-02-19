const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    loadMore: true,
    forumNumber: '',
    inputValue: '',
    commentList: [],
    lock: false,
    disable: false,
    //playBtn: app.img.playBtn,
    noHeadImg: app.img.noHeadImg,
    fullStar: app.img.fullStar,
    halfStar: app.img.halfStar,
    fullLike: app.img.fullLike,
    halfLike: app.img.halfLike,
    banImg: "/images/public/found_icon_de_in_su@2x.png",
  },

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    app.common.navTitle("评论")
    this.data.forumId = options.forumId
    this.data.forumNumber = options.forumNumber
    this.data.authorNumber = options.authorNumber
    if (options.forumNumber)this.getCommentList(options.forumNumber)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      commentList: [],
      pageNumber: 1,
      loadMore: true,
    })
    this.getCommentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let count = this.data.count
    let loadMore = this.data.loadMore
    let length = this.data.commentList.length
    if (loadMore && (count > length)) {
      //触底加载更多数据
      this.getCommentList()
    }
  },
  //回复页面跳转
  answerPage(e) {
    let commentId = e.currentTarget.dataset.cid
    wx.navigateTo({
      url: '/pages/found/answer/answer?commentId=' + commentId + "&forumNumber=" + this.data.forumNumber,
    })
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
        if (res.statusCode == 200) {
          let list = res.data.data.dataList
          let array = this.data.commentList
          if (list == null || list.length == 0) this.setData({ noCommentData: true,loadMore: false })
          if (list.length > 0)
          {
            if (list.length < 10) this.setData({ loadMore: false })
            if (list.length == 10) this.data.pageNumber ++
            for (let i = 0; i < list.length; i++)
            {
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
          this.setData({ commentList: array, count: res.data.data.count })
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
        $Toast({ content: "已经点过赞了" })
        return false
      }
      _this.setData({ lock: true })
      app.wxApi.wxPost("api-tribune/comment/commentPraise", data)
        .then(res => {
          _this.setData({ lock: false })
          console.log("帖子评论点赞结果", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            $Toast({ content: res.data.msg })
            for (let i = 0; i < list.length; i++) {
              if (cid == list[i].commentId) {
                list[i].isPraise = 1
                list[i].commentPraise ++
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
      $Toast({ content: "已经举报过了" })
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
  tapEvent() {
    this.setData({ cid: 0 })
    app.common.checkProhibit(app, this)
  },
  // 给input输入框，设置获取焦点
  inputGetFocus(e) {
    this.setData({
      autoFocus: true,
      cid: e.currentTarget.dataset.cid,
    })
    app.common.checkProhibit(app, this)
  },
  checkCont(e) {
    let value = e.detail.value
    this.setData({ inputValue: value })
  },
  //发布评论
  submitComment() {
    let lock = this.data.lock
    let value = this.data.inputValue
    //let forumNumber = this.data.forumNumber
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
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.commentList.length>0){
      this.setData({
        commentList: [],
        pageNumber: 1,
        loadMore: true,
      })
      this.getCommentList()
    }
  },
})