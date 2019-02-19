const app = getApp()
var location = require('../../utils/dingwei.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    typeId: 6,
    noHeadImg: app.img.noHeadImg,
    memberImg: app.img.memberImg,
    logoImg: "/images/dynamic/course_icon_logo@2x.png",
    scanImg: "/images/dynamic/home_icon_scan@2x.png",
    moreHandle: "/images/dynamic/found_dot@2x.png",
    
    womanImg: "/images/dynamic/woman_one@2x.png",
    manImg: "/images/dynamic/man_one@2x.png",
    addressImg: "/images/dynamic/home_icon_ad_f@2x.png",

    likeImg: "/images/dynamic/like@2x.png",
    commentImg: "/images/dynamic/count@2x.png",
    dynamicImg: "/images/dynamic/share@2x.png",

    selfShareImg: "/images/dynamic/myself_icon_tr@2x.png",
    myFollow: "/images/public/myfollow_icon_no@3x.png",

    latitude: 0,
    longitude: 0,
    showType:1,
    sType: [
      { type: 1, text: "附近动态", checked: true, },
      { type: 2, text: "附近的人", checked: false, },
      { type: 3, text: "关注的人", checked: false, },
    ],
    dtDetail: [],
    nearPeople: [],
    //userNumber: '', 
    handleType: 'report',  //  delete
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //app.Toast.Toast({ content : "新动态更改" })
    // if (options.handleType && options.handleType == 'delete') {
    //   this.setData({ handleType: options.handleType })
    // } else {
    //   this.setData({ handleType: 'report' })
    // }
    this.getLocation()
    this.getNewsType()
  },

  //获取经纬度
  getLocation(){
    let that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var gcj02tobd09 = location.gcj02tobd09(res.longitude, res.latitude);
        let longitude = gcj02tobd09[0];
        let latitude = gcj02tobd09[1];
        //that.setData({ longitude: longitude, latitude: latitude})
        that.data.longitude = longitude
        that.data.latitude = latitude
        that.getDynamicList()
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },
  //跳转到发新贴页面
  toaddNews: function () {
    let result = app.common.checkProhibit(app, this)
    if (result) {
      wx.navigateTo({
        url: '/pages/found/addNews/addNews'
      })
    }
  },
  //查询帖子类型  
  getNewsType() {
    let _this = this
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-tribune/forumtype/getTypeList", data)
      .then(res => {
        console.log("查询帖子类型", res)
        if (res.statusCode == 200 && res.data.data.length > 0) {
          this.data.typeId = res.data.data[0].typeId
        }
      })
  },
  //类型选择   
  chooseTab(e){
    let showType = this.data.showType
    let type = e.currentTarget.dataset.type
    let sType = this.data.sType
    if (showType == type)return false
    for (let i = 0; i < sType.length; i++){
      if (type==sType[i].type){
        sType[i].checked = true
      }else{
        sType[i].checked = false
      }
    }
    this.setData({ sType: sType, showType: type })
    if (type == 1){
      this.setData({
        count:0,
        pageNumber:1,
        dtDetail:[]
      })
      this.getDynamicList()
    } 
    if (type == 2) this.getNearPeople();
    if (type == 3) this.aboutPeople();
  },
  //跳转转发页面
  toForward(e){
    let fid = e.currentTarget.dataset.fid
    let data = this.data.dtDetail
    app.common.storage('forumDetail',[] )
    for(let i = 0;i<data.length;i++){
      if (fid == data[i].forumId){
        app.common.storage('forumDetail', data[i])
        wx.navigateTo({
          url: '/pages/dynamic/forward/forward',
        })
        break;
      }
    }
  },
  //获取附近动态
  getDynamicList(){
    let data = {
      typeId: this.data.typeId,
      pageNum:this.data.pageNumber,
      pageSize:10,
      lat: this.data.latitude,
      lon: this.data.longitude,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/getTypeOfList",data)
    .then( res => {
      console.log("获取附近动态", res)
      let array = this.data.dtDetail
      let list = res.data.data.dataList
      if (list.length>0){
        for (let i = 0; i < list.length;i++){
          list[i].isAuthor = false
          if (list[i].userNumber == app.userMsg.userNumber) list[i].isAuthor = true
          if (!list[i].age) list[i].age = 0
          list[i].distance = Number(list[i].distance).toFixed(1)
          if (list[i].childForum && list[i].childForum.mediaList){
            list[i].mediaList = list[i].childForum.mediaList
          }
          array.push(list[i])
        }
      }
      this.setData({ dtDetail: array, count: res.data.data.count, userNumber: app.userMsg.userNumber })

    })
  },

  //获取附近的人
  getNearPeople(){
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      lat: this.data.latitude, // //  30.55687552
      lon: this.data.longitude, // this.data.longitude, // 104.06746222
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log("查询附近的人参数", data)
    app.wxApi.wxPost("api-tribune/fourm/getNearPerson",data)
    .then( res => {
      console.log("附近的人列表", res)
      let array = this.data.nearPeople
      let list = res.data.data 
      if(list.length>0){
        for (let i = 0; i < list.length;i++){
          list[i].distance = Number(list[i].distance).toFixed(1) + 'km'
          array.push(list[i])
        }
        this.setData({ nearPeople: array })
      }
      console.log(this.data)
    })
  },

  //查询关注的人发帖  forumNumber,userNumber,lat,lon
  aboutPeople(){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      launch_user: app.userMsg.userNumber,
      lat: this.data.latitude,
      lon: this.data.longitude,
    }
    app.wxApi.wxPost("api-tribune/fourm/getFollowList", data)
      .then(res => {
        console.log("关注的人发帖",res)
        let array = []
        let list = res.data.data
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            list[i].isAuthor = false
            list[i].distance = Number(list[i].distance).toFixed(1)
            if (list[i].userNumber == app.userMsg.userNumber) list[i].isAuthor = true
            if (!list[i].age) list[i].age = 0
            if (list[i].childForum && list[i].childForum.mediaList) {
              list[i].mediaList = list[i].childForum.mediaList
            }
            array.push(list[i])
          }
        }
        this.setData({ dtDetail: array })
      })
  },
  //跳转动态详情页
  toDetailPage(e){
    let num = e.currentTarget.dataset.num
    let user = e.currentTarget.dataset.user  
    this.addScan(num);
    wx.navigateTo({
      url: '/pages/dynamic/dynamicDetail/dynamicDetail?forumNumber=' + num + "&uNumber=" + user ,
    })
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  //增加帖子浏览量
  addScan(forumNumber){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      forumNumber: forumNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/addViews",data)
    .then( res =>{
      console.log("增加浏览量结果",res)
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let type = this.data.showType
    if (type == 3) this.aboutPeople();
  },
  refreshFoundList() {
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      launch_user: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/flushFollowList", data)
      .then(res => {
        console.log("刷新关注缓存", res)
      })
    app.wxApi.wxPost("api-tribune/forumtype/flushTypeList", data)
      .then(res => {
        console.log("刷新发现缓存结果", res)
      })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function ( status = true ) {
    let that = this
    let type = this.data.showType
    if (status) app.common.showToast("数据刷新中...")
    this.refreshFoundList()
    setTimeout(() => {
      if (type == 1) {
        that.setData({
          count: 0,
          pageNumber: 1,
          dtDetail: [],
          nearPeople: [],
        })
        that.getDynamicList()
      }
      if (type == 2) that.getNearPeople();
      if (type == 3) that.aboutPeople();
    }, 150)

    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.dtDetail.length
    let type = this.data.showType
    if (type == 1){
      if (count > length) {
        this.data.pageNumber++
        this.getDynamicList()
      }
    }
    if (type == 2){
      this.data.pageNumber++
      this.getNearPeople();
    } 
  },
  // 跳转到扫码页面
  toScanPage: function () {
    wx.navigateTo({
      url: '/pages/scan/scan',
    })
  },
  // 对帖子进行点赞
  likeNews(e) {
    console.log(e)
    let islike = e.currentTarget.dataset.islike
    let id = e.currentTarget.dataset.id
    let list = this.data.dtDetail
    let data = {
      forumId: id,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    if (islike == 1) {
      app.Toast.Toast({ content: "已经点过赞了" })
      return false
    }
    app.wxApi.wxPost("api-tribune/fourm/addPraise", data)
      .then(res => {
        console.log("对帖子进行点赞结果", res)
        app.Toast.Toast({ content: res.data.msg })
        if (res.statusCode == 200 && res.data.code == 1) {
          for(let i = 0; i < list.length; i++ ){
            if(id == list[i].forumId){
              list[i].isPraise = 1
              list[i].praise += 1
            }
          }
          this.setData({ dtDetail: list })
        }
      })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "说出你的故事-一起分享心得",
      imageUrl: app.img.shareImage,
      path: '/pages/index/userLogin/userLogin',
    }
  },
})