const { $Toast } = require('../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("扫码")
  },

  /**
   * 跳转到选择订单页面
   */
  useOrderPage(){
    wx.navigateTo({
      url: '/pages/scan/useOrder/useOrder',
    })
  }, 
  /**
   * 拉起扫码
   */
  scanCode(){
    let _this = this;
    wx.scanCode({
      success:function(res){
        console.log(res)
        if(res.result){
          //从地址截取健身房number
          let index = res.result.lastIndexOf("&fitnessNumber=");
          let obj = res.result.substring(index + 1, res.result.length);
          let fitnessNumber = obj.split("=")[1]
          console.log(fitnessNumber)
          if (fitnessNumber){
            _this.getScanDetail(fitnessNumber)
          }else{
            $Toast({ content: "无法解析该健身房二维码" })
          }
        }
      },
    })
  },
  //扫码结果获取健身房number调用方法  411348445145414   
  getScanDetail(fitnessNumber = "411348445145414"){
    let data = {
      "fitnessNumber": fitnessNumber,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/other/getScavengingResult", data)
      .then(res => {
        console.log("扫码调用结果",res)
        if (res.statusCode == 200) {
          if(res.data.code == 1){
            //有订单数据，跳转到使用订单页面
            if (res.data.msg == "查询订单成功"){
              this.useOrderPage()
              app.common.storage("orderData",res.data.data)
            }
            if (res.data.msg == "查询健身房信息成功"){
              wx.navigateTo({
                url: '/pages/index/detail/detail?fitnessNumber=' + res.data.data.fitnessNumber,
              })
            }
          }else{
            $Toast({ content: "无法解析该健身房二维码" })
          }
        }
      })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    //this.getScanDetail()
  },

})