const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 0,
    address:'',
    forumDetail: [],
    orderImg: app.img.orderImg,
    showAddress: true,
    lock: false,
    addressImg: "/images/dynamic/home_icon_ad_f@2x.png",
    closeImg: "/images/public/login_icon_cl@3x.png",
    shareImg: "/images/dynamic/gym_icon_de_sha@2x.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("新动态")
    let city = app.cityInfo
    let forum = app.common.getStorage('forumDetail')
    console.log("帖子详情1", forum)
    if (forum.childForum) forum = forum.childForum
    console.log("帖子详情2",forum)
    forum.showCont = forum.context
    if (forum.context.length>45)forum.showCont = forum.context.slice(0,45) + "..."
    this.setData({ forumDetail: forum, longitude: city.longitude, latitude: city.latitude, address: city.cityAddress })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //获取文本框输入内容---统计字数
  getCont: function (e) {
    console.log(e)
    let val = e.detail.value;
    let that = this;
    let len = 0;
    if (val.length > 0) {
      len = val.length;
      if (len >= 500) len = 500;
    }
    that.setData({
      num: len
    });
    //replace(/(^\s*)|(\s*$)/g, "")  //  空格替换为空
    return val.replace(/\n/, "");
  },
  //选择地址
  chooseAddress() {
    let that = this
    wx.chooseLocation({
      success: function(res) {
        console.log(res)
        that.setData({ address: res.name, longitude: res.longitude, latitude: res.latitude })
      },
    })
    // wx.openLocation({
    //   latitude: 30.578984,
    //   longitude: 104.072742,  //  
    // })
  },
  //关闭显示的地址
  closeAddress(e){
    this.setData({ showAddress: false })
  },
  //保存转发动态
  saveDynamic(e){
    console.log(e)
    let lock= this.data.lock
    let forum = this.data.forumDetail
    let content = (e.detail.value.context).replace(/(^\s*)|(\s*$)/g, "")  //去掉前后空格

    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      forumCity: forum.forumCity,
      forumTypeId: forum.forumTypeId,
      title: '',
      context: content,
      mediaList: [],
      lon: this.data.longitude,
      lat: this.data.latitude,
      address: this.data.address,
      hrefforumid: forum.forumId,
    }
    if (forum.mediaList.length>0){
      for (let i = 0; i < forum.mediaList.length; i++) {
        if (i < 6) data.mediaList.push({ url: forum.mediaList[i].url, description: '', status: 1, statusActive: 1 })
      }
    }
    console.log("保存数据",data)
    //发布内容敏感词检测
    if (content) {
      if (lock) return false
      this.data.lock = true
      app.wxApi.wxPost("api-media/aiCheck/checkText", { str: content })
        .then(res => {
          console.log("文件检测结果", res)
          if (res.statusCode == 200) {
            this.data.lock = false
            if (res.data.code == 10037) {
              app.Toast.Toast({ content: res.data.msg })
              return false
            }
            if (res.data.code == 1) {
              this.saveShareData(data)
            }
          }
        })
    } else {
      this.saveShareData(data)
    }
  },

  //帖子保存
  saveShareData(data) {
    this.data.lock = true
    app.wxApi.wxPost("api-tribune/fourm/addForum", data)
      .then(res => {
        this.data.lock = false
        console.log("发布帖子动态结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          //app.Toast.Toast({ content: res.data.msg })
          //刷新发现页面数据
          // let pages = getCurrentPages();
          // let prevPage = pages[pages.length - 2];   //上一个页面---发现首页
          // prevPage.onPullDownRefresh(false)
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1
            })
          },500)

        } 
      })
  },
  // 显示发帖协议提示
  lookAgreement(e) {
    let status = e.currentTarget.dataset.status
    if (status == 'open') {
      this.setData({ showAgreement: true })
    } else {
      this.setData({ showAgreement: false })
    }
  },
  //查看协议
  agreementPage() {
    wx.navigateTo({
      url: '/pages/found/agreement/agreement',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})