
const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
let wxLogin = app.wxApi.wxLogin();
let wxGetUserInfo = app.wxApi.wxGetUserInfo();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    closeImg: "/images/public/login_icon_cl@3x.png",
    wxImg: "/images/public/login_icon_w@3x.png",
    showHead: true,
    showModalStatus: false,
    encryptedData: '',
    iv: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("携带的参数",options)
    let _this = this
    //获取授权列表 ------登录时必须保证wx.login在wx.getUserInfo之前调用
    wx.getSetting({
      success: (res) => {
        console.log("授权列表", res)
        //没有授权
        if (res.authSetting['scope.userInfo'] == 'undefined' || !res.authSetting['scope.userInfo']) {
          this.setData({ showModalStatus: true })
          _this.userLogin(false)
        }
        //已授权
        if (res.authSetting['scope.userInfo']) {
          app.common.showToast("登陆中...", "loading", 5000)
          this.setData({ showModalStatus: false })
          _this.userLogin(true)
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //打开授权窗口，显示授权按钮
  powerDrawer: function (e) {
    var status = e.currentTarget.dataset.statu;
    if (status == 'open') this.setData({ showModalStatus: true })
    if (status == 'close') this.setData({ showModalStatus: false })
  },
  //第一步wx.login
  userLogin(authorize){
    let _this = this
    wxLogin().then(res => {
      return app.wxApi.wxPost("api-user/login/smallProgramLogin", { code: res.code })
    })
      .then(res => {
        console.log("获取openid", res)
        app.common.storage("openid", res.data.msg.openId);
        app.common.storage("sessionKey", res.data.msg.session_key);
        if (authorize){
          return wxGetUserInfo()
        }else{
          return false
        }
      })
      .then(res => {
        if (res){
          app.globalData.userInfo = res.userInfo
          _this.data.encryptedData = res.encryptedData
          _this.data.iv = res.iv
          //执行登录流程
          _this.loginFlow(false)
        }
      })
  },
  //微信登录  smallOpenId
  wechatLogin( openid, unionid, userNumber ) {
    let _this = this
    let data = { smallOpenId: openid, unionid: unionid, userNumber: userNumber, oneLogin: false }
    app.wxApi.wxPost("api-user/login/weChatLogin", data )
      .then(res => {
        app.userMsg.userInfo = res.data.data
        app.userMsg.tokenNumber = res.data.data.tokenNumber;
        app.userMsg.userNumber = res.data.data.userNumber;
        if(res.statusCode == 200 && res.data.code ==1){
          _this.loginRecord(res.data.data.userNumber, res.data.data.tokenNumber)
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
  },
  //用户授权
  getUserInfo(e) {
    let _this = this
    if (!e.detail.userInfo){
      $Toast({ content: "请选择允许授权" })
      return false
    }else{
      app.globalData.userInfo = e.detail.userInfo
      _this.data.encryptedData = e.detail.encryptedData
      _this.data.iv = e.detail.iv
      //执行登录流程
      _this.loginFlow(true)
    }
  },
  //用户登录流程方法
  loginFlow(show){
    let _this = this
    if (show)$Toast({ content : "", type: "loading" })
    let encryptUserData = {
      encryptedData: _this.data.encryptedData,
      iv: _this.data.iv,
      session_key: app.common.getStorage("sessionKey")
    }
    console.log(encryptUserData)
    app.wxApi.wxPost("api-user/login/decryptUserInfo", encryptUserData)
    .then(res => {
      console.log("用户解密信息", res)

      if (show)$Toast.hide()
      let data = {
        smallOpenId: res.data.msg.openId,
        unionid: res.data.msg.unionId
      }
      console.log(data)
      //存储openid和unionid
      app.common.storage("unionid", res.data.msg.unionId);
      //app.common.storage("openid", res.data.msg.openId);
      //检测是否第一次登陆
      return app.wxApi.wxPost("api-user/login/checkWeChatLogin", data)
    })
    .then(res => {
      console.log("检测是否第一次登录", res)
      if (res.statusCode == 200 && res.data.oneLogin) {
        //存储是否第一次登陆  userNumber
        app.common.storage("userNumber", res.data.userNumber);
        app.common.storage("loginType", 1);
        this.setData({ showModalStatus: true })
        if (app.globalData.userInfo) {
          wx.redirectTo({
            url: "/pages/my/bindPhone/bindPhone"
          });
        }
      }
      //不是第一次登陆
      if (res.statusCode == 200 && !res.data.oneLogin) {
        //是否绑定手机号
        if (res.data.phoneNotNull){
          _this.wechatLogin(app.common.getStorage("openid"), app.common.getStorage("unionid"), res.data.userNumber)
        }else{  //没有绑定手机号
          app.common.storage("loginType", 2);
          wx.redirectTo({
            url: "/pages/my/bindPhone/bindPhone"
          });
        }
      }
    })
  },
  // 用户登录记录
  loginRecord(userNumber,tokenNumber){
    app.wxApi.wxPost("api-user/login/addLoginRecordList", { userNumber: userNumber, tokenNumber: tokenNumber} )
    .then( res => {
      console.log("增加用户访问记录",res)
    })
  },
})