const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endDate: '',
    userInfo: '',
    date:"生日",
    showModalStatus: false,
    rightImg: "/images/my/personaldata_icon_le@3x.png",
    cemeraImg: "/images/my/personaldata_icon_mod@3x.png",
    editNick: "/images/my/personaldata_icon_edit@3x.png",
    bgImg: app.img.myInfoBg,
    memberImg: app.img.memberImg,
    userData:[
      { text: "昵称", value: "", type: "nickname" },
      { text: "性别", value: "", type: "sex" },
      { text: "生日", value: "", type: "birthday" },
      { text: "个人简介", value: "", type: "introduct" },
      { text: "手机号", value: "", type: "phone" },
      // { text: "微信", value: "已绑定", type: "weixin" },
      // { text: "QQ", value: "去绑定", type: "qq" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("修改个人信息")
    this.setData({ endDate: app.common.getNowDate()})
    //this.getUserInfo()
  },

  /**
   * 修改性别
   */
  chooseSex:function(e){
    let _this = this;
    let sex = e.currentTarget.dataset.sex
    this.setData({ showModalStatus: false});
    let data = {
      "sex": sex,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    //用户信息修改
    app.wxApi.wxPost("api-user/user/updateUserMsg", data)
    .then(res => {
      if (res.statusCode == 200 && res.data.code ==1) {
        $Toast({content:res.data.msg})
        _this.getUserInfo()
      }
    })
  },
  /**
  * 修改生日
  */
  changeDate: function (e) {
    let _this = this;
    let date = e.detail.value;
    _this.setData({ date: date });
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "birthday": date + " 00:00:00",
    }
    app.wxApi.wxPost("api-user/user/updateUserMsg", data)
    .then(res => {
      if (res.statusCode == 200 && res.data.code == 1) {
        $Toast({ content: res.data.msg })
        _this.getUserInfo()
      }
    })
  },
  /**
   * 跳转到修改用户信息页面
   */
  updateUser:function(e){
    let type = e.currentTarget.dataset.type;
    let pageUrl = '/pages/my/updateUserinfo/updateUserinfo?pageType='; 
    let isPage = false;
    // 判断是否为打开页面
    if (type == 'nickname' || type == 'phone' || type == 'introduct') {
      isPage = true;
      pageUrl += type ;
    }
    if (type == 'nickname'){
      pageUrl += "&nickName=" + this.data.userInfo.nickName
    }
    if (type == 'introduct') {
      let introduction = this.data.userInfo.introduction
      if (introduction == null) introduction = ''
      pageUrl += "&introduction=" + introduction
    }
    //需要打开页面，执行页面跳转
    if (isPage == true){
      wx.navigateTo({
        url: pageUrl,
      })
    }
    if(type == 'sex'){
      this.setData({ showModalStatus: true})
    }
  },
  powerDrawer: function (e) {
    var Status = e.currentTarget.dataset.statu;
    if (Status == 'open'){
      this.setData({ showModalStatus: true })
    }else{
      this.setData({ showModalStatus: false })
    }
    //app.common.animation(currentStatu, this)
  },
  //修改用户头像,用户背景图
  updateImg(e){
    let _this = this
    let url = app.wxApi.upUrl + "fileUpload";
    let imgtype = e.currentTarget.dataset.imgtype
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    //选择图片
    wx.chooseImage({
      count: 1,
      success: function (res) {
        //上传图片
        wx.uploadFile({
          url: url,
          filePath: res.tempFilePaths[0], //res.tempFilePath,
          name: 'file',
          header: {
            "Content-Type": "multipart/form-data",
          },
          success: function (result) {   
            if (result.statusCode == 200) {
              let res = JSON.parse(result.data)
              //图片上传成功，保存用户信息  backgroundImg
              if(res.code ==1){
                if (imgtype == "head")data.headImg =  res.data
                if (imgtype == "background") data.backgroundImg = res.data
                app.wxApi.wxPost("api-user/user/updateUserMsg", data)
                  .then(res => {
                    if (res.statusCode == 200 && res.data.code == 1) {
                      $Toast({ content: res.data.msg })
                      _this.getUserInfo()
                    }
                  })
              }else{
                $Toast({content:res.msg})
                //app.common.showToast(res.msg)
              }
            }else{
              app.common.showToast("网络错误")
            }
          },
        })
      },
    })
  },
  //获取用户信息
  getUserInfo(){
    let _this = this
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/user/getUserAccount",data)
    .then( res => {
      if(res.statusCode ==200 && res.data.code == 1){
        let userData = _this.data.userData
        app.userMsg.userInfo = res.data.data
        //组装显示数据
        for (let i = 0; i < userData.length;i++){
          if (userData[i].type == "nickname") {
            userData[i].value = res.data.data.nickName
            if (userData[i].value.length > 15) userData[i].value = userData[i].value.substring(0, 15) + "..."

          }
          if (userData[i].type == "birthday" && res.data.data.birthday) userData[i].value = res.data.data.birthday.substring(0,10)
          if (userData[i].type == "phone" && res.data.data.phoneNumber) userData[i].value = res.data.data.phoneNumber
          if (userData[i].type == "introduct" && res.data.data.introduction) {
            userData[i].value = res.data.data.introduction
            if (userData[i].value.length > 15) userData[i].value = userData[i].value.substring(0,15)+"..."
          }
          if (userData[i].type == "sex") {
            let sexVal = ''
            if (res.data.data.sex == 1) {
              sexVal = '男'
            } else if (res.data.data.sex == 2){
              sexVal = '女'
            }else{
              sexVal = '保密'
            }
            userData[i].value = sexVal
          }
        }
        _this.setData({ 
          userInfo: res.data.data,
          userData: userData, 
          date: res.data.data.birthday.substring(0, 10)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户信息为空时，获取用户信息
    //if (!this.data.userInfo)
    this.getUserInfo()
  },
})