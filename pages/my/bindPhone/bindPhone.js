const app = getApp()
const { $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    code: '',
    codename: "发送验证码",
    disabled: false, //是否禁用获取验证码按钮
    forbidden: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  getPhoneVal: function (e) {
    let phone = e.detail.value;
    phone = phone.replace(/[^\d|^0]/, '');
    if (phone.length > 11) {
      phone = phone.substring(0, 11)
    }
    this.setData({
      phone: phone
    });
  },
  /**
   * 获取验证码
   */
  getCodeVal: function (e) {
    let code = e.detail.value;
    if (code.length > 4) {
      code = code.substring(0, 4)
    }
    this.setData({
      code: code
    });
  },
  /**
   * 根据手机号，获取验证码
   * 
   */
  getCode: function () {
    let _this = this;
    let reg = /^1(3|4|5|6|7|8|9)\d{9}$/
    let phone = this.data.phone;
    if (!phone) {
      app.Toast.Toast({ content: "请输入手机号" })
      return false;
    }
    if (phone.length != 11 || !reg.test(phone)) {
      app.Toast.Toast({ content: "请输入正确手机号" })
      return false;
    }
    if (phone == 18866665555){
      app.Toast.Toast({ content: "测试号：请直接输入0000作为验证码" })
      return false;
    }
    if (!this.data.forbidden) {
      app.wxApi.wxPost("api-user/login/checkPhoneIsBindUnionid", { phoneNumber: this.data.phone })
      .then( res => {
        console.log("checkPhoneIsBindUnionid:---",res)
        if(res.statusCode ==200 ){
          app.common.storage("loginCode", res.data.code)
          if (res.data.code === 10118 || res.data.code === 1 ){ // 手机号未被注册，可以进行绑定
            return app.wxApi.wxPost("api-user/login/checkPhone", { phoneNumber: phone })
          }
          if (res.data.code === 10117){
            app.Toast.Toast({ content: "手机号已经绑定微信" })
            return false
          }
          // if (res.data.code === 1) {
          //   app.Toast.Toast({ content: "手机号不可用，请更换手机号" })
          //   return false
          // }
        }
        
      })
      .then(res => {
        if(res){
          console.log("发送验证码", res)
          if (res.statusCode == 200 && res.data.code) {
            _this.setData({ codename: "59秒" })
            var num = 59;
            var timer = setInterval(function () {
              num--;
              if (num <= 0) {
                clearInterval(timer);
                _this.setData({
                  codename: '重新发送',
                  forbidden: false
                })

              } else {
                _this.setData({
                  codename: num + "秒"
                })
              }
            }, 1000)
            app.wxApi.wxPost("api-user/login/sendMsg", {
              phoneNumber: phone
            })
              .then(res => {
                console.log("获取验证码", res)
                if (res.statusCode == 200 && res.data.code) {
                  app.Toast.Toast({ content: "请查收验证码" })
                }
              })
            _this.setData({
              forbidden: true
            });
          } else {
            app.Toast.Toast({ content: res.data.msg })
            return false;
          }
        }
      })
    }
  },
  /**
   * 绑定用户手机号
   */
  updatePhone: function (e) {
    let _this = this
    let reg = /^1(3|4|5|7|8|9)\d{9}$/
    let phone = e.detail.value.phone;
    let code = e.detail.value.code;
    code = code.replace(/\s/g, "")
    if (!phone) {
      $Toast({ content: "请输入手机号" })
      return false;
    }
    if (!code) {
      $Toast({ content: "请输入验证码" })
      return false;
    }
    if (phone.length != 11 || !reg.test(phone)) {
      $Toast({ content: "请输入正确手机号" })
      return false;
    }
    if (code.length != 4) {
      $Toast({ content: "请输入正确验证码" })
      return false;
    }
    if (phone && code) {
      let data = {
        phoneNumber: phone,
        checkCode: code,
      }
      app.wxApi.wxPost("api-user/login/checkCode", data)
        .then(res => {
          console.log("检查验证码",res)
          if (res.statusCode == 200) {
            if (res.data.code == 1) {
              this.bindPhone()
              
            } else {
              $Toast({ content: res.data.msg })
            }
          }
        });
    }
  },
    //绑定手机号
  bindPhone() {

    // this.checkBindPhone()
    // return false
    let loginCode = app.common.getStorage("loginCode")
    let loginType = app.common.getStorage("loginType")
    console.log("loginCode:--", loginCode, "loginType:--", loginType)

    if (loginType ==2 && loginCode == 10118){ // 不是第一次登陆---手机号未注册
      this.weChartBindPhone()
    }
    if (loginCode == 1){ //手机号已注册---与微信进行绑定
      this.bindUionid()
    }
    if (loginCode == 10117){
      $Toast({ content: "请更换手机号进行绑定" })
      return false
    }
    if (loginType == 1 && loginCode == 10118 ){
      app.common.storage("phone", this.data.phone)
      app.wxApi.wxPost("/api-user/login/checkPhone", { phoneNumber: this.data.phone })
      .then(res => {
        console.log("检查手机号", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          wx.navigateTo({
            url: '/pages/index/userMsg/userMsg',
          })
        }
      })
    }
  },
  //检测微信号是否绑定手机号
  checkBindPhone() {
    app.wxApi.wxPost("api-user/login/checkPhoneIsBindUnionid", { phoneNumber: this.data.phone })
      .then(res => {
        console.log("检测手机是否绑定微信", res)
        if (res.statusCode == 200 && res.data.code == 1) {

        } else {
          $Toast({ content : res.data.msg })
          return false
        }
      })
  },

  //手机号已注册---未绑定微信unionid
  bindUionid(){
    let data = {
      phoneNumber: this.data.phone,
      smallOpenId: app.common.getStorage("openid"),
      unionid: app.common.getStorage("unionid"),  //同意主体唯一标识
    }
    console.log("绑定手机号参数", data)
    app.wxApi.wxPost("api-user/login/weChartPhoneBinding", data)
      .then(res => {
        console.log("绑定手机号", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          $Toast({ content: res.data.msg })
          app.userMsg.tokenNumber = res.data.data.tokenNumber;
          app.userMsg.userNumber = res.data.data.userNumber;
          app.userMsg.userInfo = res.data.data;
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }, 300)

        } else {
          $Toast({ content: res.data.msg })
        }
      })
  },

  //手机号未注册---
  weChartBindPhone(){
    let data = {
      phoneNumber: this.data.phone,
      smallOpenId: app.common.getStorage("openid"),
      openId: app.common.getStorage("openid"),
      unionid: app.common.getStorage("unionid"),  //同意主体唯一标识
    }
    app.wxApi.wxPost("api-user/login/weChartBindPhone", data )
      .then(res => {
        console.log("检测手机是否绑定微信", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          $Toast({ content: res.data.msg })
          app.userMsg.tokenNumber = res.data.data.tokenNumber;
          app.userMsg.userNumber = res.data.data.userNumber;
          app.userMsg.userInfo = res.data.data;
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }, 300)
        } else {
          $Toast({ content: res.data.msg })
          return false
        }
      })
  },

})