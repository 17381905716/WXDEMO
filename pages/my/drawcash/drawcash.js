const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
    transfer: false,
    drawcash: false,
    cashBgimg: "/images/my/withdraw_bg@3x.png",
    closeImg: "/images/my/c_icon_pl_cl@2x.png",
    walletBgImg: app.img.walletBgImg,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("兑换鼓励金")
    let redPacketMoney = Number(app.userMsg.userInfo.redPacketMoney).toFixed(2)
    app.userMsg.userInfo.redPacketMoney = redPacketMoney
    this.setData({ userInfo: app.userMsg.userInfo })
  },

  // 显示转存提示
  transferTap(e){
    let _this = this
    this.setData({ transfer: false })
    if(e.type === 'ok'){
      let data = {
        "changeMoney": this.data.userInfo.redPacketMoney,
        "userNumber": app.userMsg.userNumber,
        "tokenNumber": app.userMsg.tokenNumber,
      }
      if (Number(this.data.userInfo.redPacketMoney) <= 0) {
        $Toast({ content: "转存金额不足" })
        return false
      }
      //调用接口
      app.wxApi.wxPost("api-pay/extract/transferToBalaner", data)
        .then(res => {
          console.log("转存余额结果", res)
          if (res.statusCode == 200){
            $Toast({ content: res.data.msg })
            if (res.data.code == 1){
              this.data.userInfo.redPacketMoney = "0.00"
              this.setData({ userInfo: this.data.userInfo })
            }
          }else{
            $Toast({ content: "网络错误" })
          }
        })
    }
  },
  // 显示提现提示
  drawcashTap(e){
    this.setData({ drawcash: false })
    if(e.type === 'ok'){
      let openid = app.common.getStorage("openid")
      let data = {
        tokenNumber: app.userMsg.tokenNumber,
        userNumber: app.userMsg.userNumber,
        "account": openid,
        "money": app.userMsg.userInfo.redPacketMoney,
        "realName": app.userMsg.userInfo.nickName,
        "payMethod": 2,
      }
      if (Number(this.data.userInfo.redPacketMoney) <= 0) {
        $Toast({ content: "提现金额不足" })
        return false
      }
      app.wxApi.wxPost("api-pay/extract/aliOrWxExtract", data)
        .then(res => {
          console.log("提现结果", res)
          if (res.statusCode == 200) {
            $Toast({ content: res.data.msg })
            return false
          }
        })
    }
  },
  //转存余额方法
  transferBalance(){
    this.setData({ transfer : true })
  },
  //全部提现
  allDrawCash(){
    this.setData({ drawcash: true})
  },
  //查看提现记录
  lookRecord(){
    wx.navigateTo({
      url: '/pages/my/presentRecord/presentRecord',
    })
  },
  //打开兑换小窗口
  openChange(e) {
    let status = e.currentTarget.dataset.status
    if (status == 'open') {
      this.setData({ showChange: true })
    } else {
      this.setData({ showChange: false })
    }
  },
  //确定进行兑换
  enterChange(e) {
    let code = e.detail.value.code
    let changecode = e.detail.value.changecode
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "cardCode": code,
      "cardPasswd": changecode
    }
    if (!code) {
      app.Toast.Toast({ content: "请输入编码" })
      return false
    } else {
      if (code.length != 8) {
        app.Toast.Toast({ content: "请输入正确的编码" })
        return false
      }
    }
    if (!changecode) {
      app.Toast.Toast({ content: "请输入兑换码" })
      return false
    } else {
      if (changecode.length != 6) {
        app.Toast.Toast({ content: "请输入正确的兑换码" })
        return false
      }
    }
    app.wxApi.wxPost("api-user/other/useHeartenCard", data)
      .then(res => {
        console.log("兑换结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          //app.Toast.Toast({ content : res.data.msg })
          this.setData({ showChange: false })
          //重新获取用户余额
          app.common.getUserInfo(app, this)
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
})