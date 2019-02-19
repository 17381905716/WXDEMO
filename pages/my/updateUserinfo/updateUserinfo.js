const { $Toast } = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageType: "",
    num: 0,
    phone: '',
    code: '',
    codename: "获取验证码",
    disabled: false, //是否禁用获取验证码按钮
    forbidden:false,
    introduction: "",
    nickName: "",
    userInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let _this = this;
    let title = '';
    let pageType = options.pageType;
    if (pageType == "phone") title = "绑定手机号"
    if (pageType == "nickname"){
      title = "输入您的昵称"
      this.setData({ nickName: options.nickName})
    }
    
    if (pageType == 'introduct'){
      title = "输入个人简介"
      let num = 0
      if (options.introduction) num = (options.introduction).length
      if (options.introduction == null) options.introduction = ''
      this.setData({ introduction: options.introduction, num: num })
    }
    _this.setData({
      pageType: pageType
    });
    app.common.navTitle(title)
  },

  /**
   * 获取文本域内容，统计字数
   */
  getCont: function(e) {
    let val = e.detail.value;
    let that = this;
    let len = 0;
    if (val.length > 0) {
      len = val.length;
      if (len >= 100) len = 100;
    }
    that.setData({
      num: len
    });
    return val.substring(0, 100);
  },
  /**
   * 修改用户昵称
   */
  updateNick: function(e) {
    let _this = this
    let value = e.detail.value.nickname
    if (!value) {
      $Toast({ content:"请输入昵称"})
      return false
    }
    let data = {
      "userNumber": app.userMsg.userNumber,
      "nickName": value,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    //app.common.showLoading("")
    this.setData({ disabled: true })
    //文字检测是否合法
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
      .then(res => {
        console.log(res)
        if (res.statusCode == 200 && res.data.code == 1) {
          app.wxApi.wxPost("api-user/login/checkUserByParam", { nickName: value })
          .then( res => {
            console.log("昵称检测",res)
            //不存在，可以修改
            if (res.statusCode == 200 && !res.data.oneLogin){
              //执行绑定方法
              _this.saveUserInfo(data)
            }else{
              $Toast({content:"昵称已存在"})
              this.setData({ disabled: false })
              return false
            }
          })
        } else {
          //app.common.hideLoading()
          this.setData({ disabled: false })
          $Toast({ content: res.data.msg })
        }
      })
  },
  /**
   * 修改用户简介
   */
  introduct: function(e) {
    let _this = this
    let value = e.detail.value.content
    if (!value){
      $Toast({ content: "请输入个人简介" })
      return false
    }
    let data = {
      "userNumber": app.userMsg.userNumber,
      "introduction": value,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    this.setData({ disabled: true })
    //文字检测是否合法
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
    .then( res => {
      console.log(res)
      if(res.statusCode == 200 && res.data.code == 1){
        //执行绑定方法
        _this.saveUserInfo(data)
      }else{
        this.setData({ disabled: false })
        $Toast({ content: res.data.msg })
      }
    })
  },
  /**
   * 修改用户手机号，保存方法
   */
  updatePhone: function(e) {
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
        phoneNumber : phone,
        checkCode : code,
      }
      app.wxApi.wxPost("api-user/login/checkCode", data)
        .then(res => {
          if(res.statusCode == 200){
            if (res.data.code == 1){
              let data = {
                "userNumber": app.userMsg.userNumber,
                "phoneNumber": phone,
                "tokenNumber": app.userMsg.tokenNumber,
              }
              //验证码正确，执行绑定方法
              _this.saveUserInfo(data)
            }else{
              $Toast({ content: res.data.msg })
            }
          }  
        });
    }
  },
  /**
   * 保存用户电话号码，昵称，个人简介
   */
  saveUserInfo(data){
    let _this = this
    let pages = getCurrentPages();
    let prevPage = pages[pages.length -2 ];   //上一个页面
    this.setData({ disabled: true })
    app.wxApi.wxPost("api-user/user/updateUserMsg", data)
    .then(res => {
      if (res.statusCode == 200) {
        $Toast({ content: res.data.msg })
        setTimeout(function () {
          _this.setData({ disabled: false })
          wx.navigateBack({
            delta: 1
          })
          console.log(prevPage)
          if (_this.data.pageType == 'nackname')prevPage.data.userInfo.nickName = _this.data.nickName
          if (_this.data.pageType == 'introduct')prevPage.data.userInfo.introduction = _this.data.introduction
          prevPage.getUserInfo()
        }, 1500)
      }
    })
  },
  /**
   * 获取电话号码
   */
  getPhoneVal: function(e) {
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
  getCodeVal: function(e) {
    let code = e.detail.value;
    if (code.length > 4 ) {
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
  getCode: function() {
    let _this = this;
    let reg = /^1(3|4|5|7|8|9)\d{9}$/
    let phone = this.data.phone;
    if (!phone) {
      $Toast({ content: "请输入手机号" })
      return false;
    }
    if (phone.length != 11 || !reg.test(phone)) {
      $Toast({ content: "请输入正确手机号" })
      return false;
    }
    if (!this.data.forbidden) {
      app.wxApi.wxPost("api-user/login/checkPhone", {
          phoneNumber: phone
        })
        .then(res => {
          if (res.statusCode == 200 && res.data.code) {
            _this.setData({codename:"59秒"})
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
                if (res.statusCode == 200 && res.data.code) {
                  $Toast({ content: "请查收验证码" })
                }
              })
            _this.setData({
              forbidden: true
            });
          } else {
            $Toast({ content: res.data.msg })
            //app.common.showToast("号码已存在，请换个手机号");
            return false;
          }
        })
    }
  },
  //获取用户信息
  getUserInfo(){
    let _this = this
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/user/getUserAccount", data)
    .then(res => {
      if (res.statusCode == 200 && res.data.code == 1){
        _this.setData({ 
          userInfo: res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //this.getUserInfo()
  },
})