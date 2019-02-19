// pages/index/outPage/outPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "", ///   http://sj.qq.com/myapp/detail.htm?apkName=com.tencent.mtt
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({url:options.url})
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})