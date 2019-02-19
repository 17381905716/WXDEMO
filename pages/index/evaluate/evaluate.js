const app  = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starImg: app.img.starImg,
    noStarImg: app.img.noStarImg,
    array: [0,1,2,3,4],
    noHeadImg: app.img.noHeadImg,
    fitnessNumber: '',
    commentList: [],
    count: 0,
    loadMore: true,
    pageNumber: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("用户评价")
    this.data.fitnessNumber = options.fitnessNumber
    //app.Toast.Toast({ content: "用户评价" })
    this.commentList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      loadMore: true,
      pageNumber: 1,
      commentList: []
    })
    this.commentList()
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
    let loadMore = this.data.loadMore
    if (loadMore && (count > length)) {
      //触底加载更多数据
      this.commentList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //获取健身房评论列表
  commentList() {
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      pageNum: this.data.pageNumber,
      pageSize: 10,
      fitnessNumber: this.data.fitnessNumber
    }
    app.wxApi.wxPost("api-fitness/comment/queryComment", data)
    .then(res => {
      console.log("健身房评论", res)
      let list = res.data.data
      let oldList = this.data.commentList
      if (!list || list.length < 10 )this.data.loadMore = false
      if (list && list.length > 0) {
        if (list.length == 10)this.data.pageNumber ++;
        for (let i = 0; i < list.length; i++) {
          if (!list[i].level) list[i].level = 0
          list[i].level = Math.round(list[i].level)
          oldList.push(list[i])
        }
      }
      this.setData({ commentList: oldList, count: res.data.count })
    })
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  //预览轮播大图片
  previewCommentImage(e) {
    let array = []
    let cid = e.currentTarget.dataset.cid
    let data = this.data.commentList
    for (let i = 0; i < data.length; i++) {
      if (cid == data[i].cid) {
        if (data[i].img1) array.push(data[i].img1)
        if (data[i].img2) array.push(data[i].img2)
        if (data[i].img3) array.push(data[i].img3)
      }
    }
    wx.previewImage({
      urls: array,
    })
  },
})