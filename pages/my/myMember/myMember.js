const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {   
    myMember: app.img.myMember,
    helpImg: "/images/my/myorder_icon_help_t@3x.png",
    userInfo: "",
    showModalStatus: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("我的会员")
    this.setData({ userInfo : app.userMsg.userInfo })
    
  },
  //跳转购买会员卡页面
  buyCardPage(){
    wx.navigateTo({
      url: '/pages/my/buyCard/buyCard',
    })
  },
  powerDrawer: function (e) {
    let currentStatu = e.currentTarget.dataset.statu;
    app.common.animation(currentStatu, this)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({ userInfo: app.userMsg.userInfo })
  },
})