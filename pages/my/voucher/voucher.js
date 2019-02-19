const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    voucherList : [],
    orderBg1: app.img.orderBg1,
    notVoucher: "/images/my/coupon_icon_no@2x.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("优惠券")
    this.getVoucherList()
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
      voucherList: [],
      pageNumber: 1,
      count: 0,
    })
    this.getVoucherList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.voucherList.length
    if (count > length) {
      //触底加载更多数据
      this.data.pageNumber ++
      this.getVoucherList()
    }
  },
  // 获取优惠券列表
  getVoucherList(){
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      "pageNumber": this.data.pageNumber,
      "pageSize": 10,
      "phoneNumber": app.userMsg.userInfo.phoneNumber,
      "status": 1,
    }
    app.wxApi.wxPost("api-user/user/getCoupon",data)
    .then( res => {
      console.log("获取优惠券列表",res)
      if(res.statusCode ==200 && res.data.code==1){
        let array = this.data.voucherList
        let list = res.data.data
        if (list && list.length>0){
          for (let i = 0; i < list.length; i++) {
            list[i].money = Number(list[i].money).toFixed(2)
            // list[i].aeadTime = list[i].aeadTime.slice(0, 10)
            // list[i].aeadStartTime = list[i].aeadStartTime.slice(0, 10)
            array.push(list[i])
          }
        }
        this.setData({ voucherList : array,count:res.data.count })
      }else{
        app.Toast.Toast({ content : res.data.msg })
      }
    })
  },
  //确定使用优惠券
  enterUse(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})