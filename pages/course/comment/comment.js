const {$Toast} = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentList: [],
    inputValue: '',
    lock: false,
    disabled: false,
    loadMore: true,
    pageNumber: 1,
    count: 0,
    fullLike: app.img.fullLike,
    noHeadImg: app.img.noHeadImg,
    memberImg: app.img.memberImg,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.common.navTitle("评论")
    this.data.classNumber = options.classNumber
    this.getCommentList()
    let timestamp = new Date().getTime()
    console.log("onLoad", timestamp)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let timestamp = new Date().getTime()
    console.log("onReady", timestamp)
  },
  //获取评论列表
  getCommentList() {
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      classNumber: this.data.classNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    console.log("评论列表参数", data)
    app.wxApi.wxPost("api-teaching-video/commentvedio/getCommentList", data)
      .then(res => {
        console.log("获取评论列表", res)
        if (res.statusCode == 200) {
          let array = this.data.commentList
          let list = res.data.data.dataList
          if (list == null || list.length == 0 ) this.setData({ noCommentData: true, loadMore: false })
          if (list.length > 0) {
            if(list.length < 10)this.setData({ loadMore : false })
            if(list.length == 10)this.data.pageNumber ++ 
            for (let i = 0; i < list.length; i++) {
              if (list[i].nickName && list[i].nickName.length > 15) {
                list[i].nickName = list[i].nickName.substring(0, 15) + "..."
              }
              array.push(list[i])
            }
          } this.setData({ commentList: array,count: res.data.data.count })
        }
      })
  },
  //评论点赞
  likeComment(e) {
    console.log(e)
    let commentList = this.data.commentList
    let id = e.currentTarget.dataset.id
    let status = e.currentTarget.dataset.status
    let data = {
      commentId: id,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    console.log(status, "------", data)
    if (status == 1) {
      app.common.showToast("已点过赞了", "success")
    } else {
      //调用点赞方法
      app.wxApi.wxPost("api-teaching-video/commentvedio/commentPraise", data)
        .then(res => {
          console.log("评论点赞结果", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            app.common.showToast("点赞成功", "success")
            //更新当前评论列表数据
            if (commentList.length > 0) {
              for (let i = 0; i < commentList.length; i++) {
                if (id == commentList[i].commentList.commentId) {
                  commentList[i].isPraise = 1
                  commentList[i].commentList.commentPraise++
                }
              }
              this.setData({
                commentList: commentList
              })
            }
          }
          //this.setData({ videoData: res.data.data })
        })
    }
  },
  //检测是否禁言
  checkProhibit() {
    console.log("检测是否被禁言")
    let prohibit = app.userMsg.userInfo.isAnExcuse //1未禁言，2已被禁言
    let dayAnExcuse = app.userMsg.userInfo.dayAnExcuse //禁言天数
    let startAnExcuse = app.userMsg.userInfo.startAnExcuse //开始禁言时间
    //检测是否被禁言，计算禁言天数
    if (prohibit == 1) this.setData({ disable: false })
    if (prohibit == 2) {
      this.setData({
        disable: true,
        inputValue: ''
      })
      wx.showModal({
        title: '您被禁言',
        content: '您将于' + dayAnExcuse + '天后解除禁言',
        showCancel: false
      })
      return false
    }
  },
  checkCont(e) {
    let value = e.detail.value
    this.setData({ inputValue: value })
  },
  //发布评论
  submitComment(e) {
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
    if (value) {
      if (lock) return false
      //执行文字审核  api-media/aiCheck/checkText
      this.setData({ lock: true })
      app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
        .then(res => {
          this.setData({
            lock: false
          })
          console.log("文字审核结果", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            //app.common.showLoading("评论保存中...")
            this.setData({
              lock: true
            })
            app.wxApi.wxPost("api-teaching-video/commentvedio/addComment", data)
              .then(res => {
                if (res.statusCode == 200) {
                  this.setData({
                    lock: false
                  })
                  //app.common.hideLoading()
                  if (res.data.code == 1) {
                    $Toast({
                      content: res.data.msg
                    })
                    this.setData({
                      inputValue: '',
                      commentList: [],
                    })
                    //app.common.showToast("发布评论成功", "success")
                    this.getCommentList()
                    
                  }
                }
              })
            //文本检测不合格，包含敏感词
          } else {
            $Toast({
              content: res.data.msg
            })
          }
        })
    } else {
      $Toast({
        content: "请输入评论内容"
      })
    }
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    app.common.showToast("数据刷新中···")
    this.setData({ 
      commentList: [],
      loadMore: true,
      pageNumber: 1,
    })
    this.getCommentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let loadMore = this.data.loadMore
    let count = this.data.count
    let length = this.data.commentList.length
    if(loadMore && (length < count)){
      this.getCommentList()
    }
  },
})