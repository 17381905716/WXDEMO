// pages/index/payResult/payResult.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    successImg: "/images/public/pay_icon_succ@3x.png",
    failImg: "/images/public/pay_icon_def@3x.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let status = options.status
    this.data.pType = options.pType
    if (status == 1){
      this.setData({ status: status, title: "支付成功", msgText: "您的订单已成功支付", btnText: "确认", resultImg: this.data.successImg})
    }else{
      this.setData({ status: status, title: "支付失败", msgText: "您的订单支付失败", btnText: "重新支付", resultImg: this.data.failImg})
    }
    app.common.navTitle(this.data.title)
    this.getUserInfo()
  },
  //回到支付页面、跳转
  payResultPage(e){
    let status = e.currentTarget.dataset.status
    let pType = this.data.pType
    let pageUrl = '/pages/index/index'
    console.log(status, "----------", pType)
    if(status == 1){ //支付成功
      if (pType == 'jump'){
        wx.switchTab({
          url: pageUrl,
        })
      }
      if (pType == 'back'){
        wx.navigateBack({
          delta: 1
        })
      }
      
    }else{
      wx.navigateBack({
        delta: 1
      })
    }
  },
  //获取用户信息  
  getUserInfo() {
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/user/getUserAccount", data)
      .then(res => {
        console.log("用户信息", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          let balance = res.data.data.balance.toFixed(2)
          //res.data.data.redPacketMoney = res.data.data.redPacketMoney.toFixed(2)
          app.userMsg.userInfo = res.data.data
          // this.setData({
          //   balance: balance,
          //   //userInfo: res.data.data
          // })
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
})