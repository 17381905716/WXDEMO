// pages/my/customerServer/customerServer.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '028-62084560',
    data:[
      { question: "1.为什么我的订单过期了？", answer: "请查看一下您的订单是否已超过可使用时间" },
      { question: "2.为什么到店扫码没有显示可用订单？", answer: "请查看一下您的订单是否在可以使用时间范围内" },
      { question: "3.我的退款多久可以到账？", answer: "若您接到退款成功的提示信息，7个工作日内退回到您支付的账户内" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("联系客服")
  },
  /**
   * 拨打客服电话
   */
  callPhone() {
    let _this = this
    wx.showModal({
      title: '',
      content: '确定拨号：' + this.data.phone,
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: _this.data.phone,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

})