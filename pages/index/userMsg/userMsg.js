const app = getApp()
const { $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex:'',
    date:"选择生日",
    nickName: '',
    userPhoto: app.img.noHeadImg,
    headid : 0,
    showModalStatus: false,
    data:[],
    disabled : false,
    endDate: ''
  },
  otherData: {
    otherData: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    _this.setData({
      sex: app.globalData.userInfo.gender,
      nickName: app.globalData.userInfo.nickName,
      userPhoto: app.globalData.userInfo.avatarUrl,
      endDate: app.common.getNowDate()
    });
    wx.getSystemInfo({
      success:function(res){
        _this.otherData.phoneInfo = res
      }
    })
    this.headPhoto()
  },
  /**
   * 选择日期方法
   */
  changeDate:function(e){
    let _this = this;
    let date = e.detail.value;
    this.setData({date:date});
  },
  //获取昵称
  getNickName:function(e){
    let nickName = e.detail.value
    this.setData({ nickName: nickName })
  },
  /**
   * 保存用户信息
   */ 
  saveUserMsg: function(){
    let _this = this
    let birthday = this.data.date
    let nickName = this.data.nickName
    nickName = nickName.replace(/(^\s*)|(\s*$)/g, "")
    if (birthday.length > 4) birthday += " 00:00:00"

    let phoneInfo = this.otherData.phoneInfo
    if (phoneInfo.brand != 'iPhone' )phoneInfo.brand = (phoneInfo.brand).toLowerCase()
    let data = {
      nickName: nickName,
      sex: this.data.sex,
      headImg: this.data.userPhoto,
      birthday: birthday,
      oneLogin: true,
      smallOpenId: app.common.getStorage("openid"),
      unionid: app.common.getStorage("unionid"),  //同意主体唯一标识
      appChannel: "WeChat",
      phoneBrand: phoneInfo.brand,
      phoneType: phoneInfo.model,
      appSystemVersion: phoneInfo.system,
      appSystem: phoneInfo.platform,
      phoneNumber: app.common.getStorage("phone"),
    }
    if (!nickName){
      $Toast({content:"请输入昵称"})
      return false
    }
    if (this.data.date.length <= 4) {
      $Toast({ content: "请选择生日" })
      return false;
    }
    this.setData({ disabled : true})
    //检测输入的昵称是否有敏感词
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: this.data.nickName })
    .then( res => {
      if (res.statusCode == 200) {
        this.setData({ disabled: false })
        if(res.data.code ==1){
          this.setData({ disabled: true })
          app.wxApi.wxPost("api-user/login/checkUserByParam", { nickName: nickName })
            .then(res => {
              //不存在，可以修改
              if (res.statusCode == 200 && !res.data.oneLogin) {
                //执行绑定方法
                app.wxApi.wxPost("api-user/login/weChatLogin", data)
                  .then(res => {
                    if (res.statusCode == 200) {
                      this.setData({ disabled: false })
                      if (res.data.code == 1) {
                        $Toast({ content: "登陆成功" })
                        app.userMsg.tokenNumber = res.data.data.tokenNumber;
                        app.userMsg.userNumber = res.data.data.userNumber;
                        app.userMsg.userInfo = res.data.data;
                        _this.loginRecord(res.data.data.userNumber, res.data.data.tokenNumber)
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                      } else {
                        $Toast({ content: res.data.msg })
                        return
                      }
                    }
                  })
              } else {
                $Toast({ content: "昵称已存在" })
                this.setData({ disabled: false })
                return false
              }
            })
        }
        if(res.data.code ==10037){
          $Toast({ content: res.data.msg })
          return false
        }
      }else{
        $Toast({ content: res.data.msg })
      }
    })
  },

  //获取头像数据
  headPhoto(){
    let _this = this;
    app.wxApi.wxPost("api-user/login/getUserHeadImg", { sex: app.globalData.userInfo.gender})
    .then( res => {
      if(res.statusCode == 200 && res.data.data.length>0){
        _this.setData({ data: res.data.data })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 显示弹出层，头像图片
   */
  updatePhoto(){
    this.setData({ showModalStatus: true})
  },
  //选择头像
  checkPhoto(e){
    let headid = e.currentTarget.dataset.headid
    let data = this.data.data
    this.setData({ showModalStatus: false })
    for(let i = 0; i < data.length; i++){
      if (headid == data[i].headId){
        this.setData({ data: data, headid: headid, userPhoto : data[i].headImg })
        break;
      }
    } 
  },
  //显示弹出层
  powerDrawer: function (e) {
    let currentStatu = e.currentTarget.dataset.statu;
    app.common.animation(currentStatu,this)
  },
  // 用户登录记录
  loginRecord(userNumber, tokenNumber) {
    app.wxApi.wxPost("api-user/login/addLoginRecordList", { userNumber: userNumber, tokenNumber: tokenNumber })
      .then(res => {
      })
  },
})