const app = getApp()
const { $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    loadMore: true,
    presentList : [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("兑换记录")
    this.presentList()
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
    app.common.showToast("数据刷新中...");
    this.setData({
      count : 0,
      pageNumber: 1,
      presentList: [],
    })
    this.presentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.presentList.length
    if (count > length) {
      //触底加载更多数据
      this.data.pageNumber++
      this.presentList()
    }
  },
  //获取兑换数据
  presentList(){
    let data = {
      "pageNumber": this.data.pageNumber,
      "pageSize": 10,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-user/other/getHeartenCardDetailsByUserNumber",data)
    .then( res => {
      console.log("提现数据",res)
      if(res.statusCode == 200){
        if(res.data.code == 10051){
          $Toast({content:res.data.msg})
          return false
        }
        if(res.data.code == 1){
          let array = this.data.presentList
          let list = res.data.data
          //if(list == null || list.length < 10)this.setData({ loadMore :false })
          //if(list.length ==10)this.data.pageNumber ++
          if(list.length > 0){
            for(let i=0;i<list.length;i++){
              list[i].money = Number(list[i].money).toFixed(2)
              array.push(list[i])
            }
          }
          this.setData({ presentList: array, count : res.data.count })
        }
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showLoading("数据刷新中···")
    let sType = this.data.sType
    this.setData({
      loadMore: true,
      pageNumber: 1,
      presentList: []
    })
    this.presentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      app.common.hideLoading()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let loadMore = this.data.loadMore
    if (loadMore) {
      //触底加载更多数据
      this.presentList()
    }
  },
})