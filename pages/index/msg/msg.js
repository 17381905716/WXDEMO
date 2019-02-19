// pages/index/msg/msg.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNumber: 1,
    loadMore: true,
    noData:false,
    orderImg: "/images/index/news_icon_fi@3x.png",  // 订单
    aboutImg: "/images/index/news_icon_tw@3x.png",  // 关注
    systemImg: "/images/index/news_icon_thr@3x.png",  // 系统
    activityImg: "/images/index/news_icon_fo@3x.png",  // 活动
    cardImg: "/images/index/news_icon_fi_vip@2x.png",  // 购买会员卡消息图片
    profitImg: "/images/index/news_icon_red@2x.png",  // 收益
    msgData:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("消息");
    this.getMsgList()
  },
  //获取消息列表
  getMsgList(){
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/message/queryList",data)
    .then( res => {
      console.log("消息列表",res)
      if(res.statusCode == 200){
        let list = res.data.data
        if (res.data.data == null || res.data.data.pageData.length ==0)this.setData({ noData : true })
        if (list){
          let data = res.data.data.pageData
          if (data.length > 0) {
            let array = this.data.msgData
            if (data == null || data.length < 10) this.setData({ loadMore: false })
            if (data.length == 10) this.data.pageNumber++
            //放入消息类型对应的图片
            for (let i = 0; i < data.length; i++) {
              if (data[i].messagetypeid == 1) data[i].img = this.data.orderImg
              if (data[i].messagetypeid == 2) data[i].img = this.data.aboutImg
              if (data[i].messagetypeid == 3) data[i].img = this.data.profitImg
              if (data[i].messagetypeid == 4) data[i].img = this.data.activityImg
              if (data[i].messagetypeid == 5) data[i].img = this.data.cardImg
              if (data[i].messagetypeid == 6) data[i].img = this.data.systemImg
              array.push(data[i])
            }
            this.setData({ msgData: array })
          }
        }
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      loadMore: true,
      pageNumber: 1,
      msgData: []
    })
    this.getMsgList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let loadMore = this.data.loadMore
    if (loadMore) {
      this.getMsgList()
    }
  },
  //小程序分享
  onShareAppMessage: function (res) {
    return {
      title: "这么豪华的健身房居然这么便宜",
      imageUrl: app.img.shareImage,
      path: '/pages/index/userLogin/userLogin?type=test',
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

})