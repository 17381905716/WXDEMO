const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appName:'',
    practiceImg: "/images/public/download_img@3x.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取手机号类型
    let name = '应用商店'
    let wxGetSystemInfo = app.wxApi.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      let phoneType = res.platform //获取手机系统，ios或安卓
      //console.log("手机参数", res)
      if (phoneType == 'ios')name = 'App Store'
      if (phoneType == 'android') name = '应用宝'
      this.setData({ appName: name})
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  //下载app
  loadApp(){
    app.common.showToast("暂时还不能下载")

  },
})