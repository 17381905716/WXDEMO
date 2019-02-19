
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    aboutData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.common.navTitle("关于我们")
    this.getAboutContent()
  },
  // 获取关于我们的内容
  getAboutContent() {
    let _this = this;
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-user/other/getAppMsg", data)
    .then(res => {
      if (res.statusCode == 200 && res.data.data.length > 0) {
        _this.setData({
          aboutData: res.data.data[0]
        })
      }
    })
  },
  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function() {
  },

})