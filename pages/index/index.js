var WxNotificationCenter = require('../../utils/WxNotificationCenter.js')
var location = require('../../utils/dingwei.js')
const { $Toast } = require('../../dist/base/index.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
//获取应用实例
const app = getApp()
let wxLogin = app.wxApi.wxLogin();
let getLocation = app.wxApi.wxGetLocation();

Page({
  data: {
    pageNumber: 1,
    count: 0,
    searchId: 1, //分类id，默认加载附近
    cityId: 1,
    cityName: "成都市",
    latitude: 30.578984,
    longitude: 104.072742,  //  
    noDataImg1: app.img.noDataImg1,
    noFitnessImg: app.img.noFitnessImg,
    starImg: app.img.starImg,
    noStarImg: app.img.noStarImg,
    openImg:"/images/index/home_icon_open@2x.png",
    closeImg: "/images/index/home_icon_clo@2x.png",
    whiteChannel: "/images/dynamic/white@2x.png",
    sType: [],
    advertImg: [],
    nearActivity: [],
    fitness: [],
    array: [0, 1, 2, 3, 4],  //控制是否显示5颗星
    showModalStatus: false,
    getLocation: false,
    loading: false,
    //loadMore: true,  //是否还可以加载更多数据
    noFitnessData: false,
    noFitnessText: "暂时没有健身房",
    // shareTitle: '',
    // shareImg: '',
  },
  onLoad: function (options) {
    // 腾讯地图--获取当前城市
    //this.getNowCity()

    if (options && options.relogin == 1) this.wechatLogin()
    //获取位置信息
    this.userLocation()
    //注册通知
    app.wxNotice.addNotification('noticeName', this.switchCityInform, this)

  },

  /**
  * 搜索方法---健身房分类
  */
  choose: function(e){
    //获取选中的下标、健身房类型
    let index = e.currentTarget.dataset.index;
    let sid = e.currentTarget.dataset.sid;
    if (this.data.searchId == sid)return false
    for (let i = 0; i < this.data.sType.length; i++){
      if(i == index){
        this.data.sType[i].checked = true;
      }else{
        this.data.sType[i].checked = false;
      }
    }
    //数据更新---初始化部分数据
    this.setData({ sType: this.data.sType, searchId: sid, pageNumber: 1, fitness: [], noFitnessData: false });
    this.fuzzySearch(sid);
  },
  //跳转到搜索健身房页面
  searchFitness(){
    wx.navigateTo({
      url: '/pages/index/searchFitness/searchFitness',
    })
  },
  /**
   * 分类搜索健身房
   */
  fuzzySearch: function (searchId){
    let _this = this
    let data = {
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      fitnessTypeId: searchId, //分类id
      advertCity: this.data.cityId,
      pageNumber: this.data.pageNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      //likeParam: ''
    }
    //调用搜索健身房方法
    app.wxApi.wxPost("api-fitness/fitness/getFitnessList", data)
    .then(res => {
      console.log("分类搜索健身房",res)
      let oldFitness = _this.data.fitness  //之前已加载的健身房
      let fitness = res.data.data;
      let noData = false
      // if (fitness.length < 10) _this.data.loadMore = false  //没有更多可以加载的数据
      // if (fitness.length == 10) _this.data.pageNumber ++  //分页页码+1
      if (fitness.length > 0) {
        for (let i = 0; i < fitness.length; i++) {
          fitness[i].success = false
          fitness[i].distance = fitness[i].distance.toFixed(1) //距离保留1位小数
          if (!fitness[i].level) fitness[i].level = 0 
          fitness[i].level = Math.round(fitness[i].level) //健身房星级四舍五入
          let activity = fitness[i].fitnessActivities  //活动
          if (activity.length>0){
            for (let j = 0; j < activity.length;j++){
              activity[j].fitnessActivityPrice = activity[j].fitnessActivityPrice.toFixed(2)
            }
          }
          oldFitness.push(fitness[i])
        }
      }
      if (oldFitness.length == 0) noData = true  //无数据
      _this.setData({ fitness: oldFitness, noFitnessData: noData, count: res.data.count, loading: false })
    })
  },
  // 跳转到扫码页面
  toScanPage:function(){
    wx.navigateTo({
      url: '/pages/scan/scan',
    })
  },
  // 跳转到店铺详情
  toDetail: function(e){
    let fitnessNumber = e.currentTarget.dataset.number;
    let indexImg = e.currentTarget.dataset.indeximg;
    wx.navigateTo({
      url: '/pages/index/detail/detail?fitnessNumber=' + fitnessNumber + "&indexImg=" + indexImg,
    })
  },
  //腾讯地图---逆地址解析
  getNowCity(){
    var qqmapsdk = new QQMapWX({
      key: '74WBZ-ZJ2KP-72CDL-LLPT4-UDIA7-57BAZ'
    });
    // 调用接口
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            console.log("腾讯地图获取位置", res);
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
          }
        });
      },
    })
  },
  // 获取用户当前城市
  getCity: function (latitude, longitude) {
    let _this = this;
    let userCity = app.userMsg.userInfo.city 
    let key = "KYGkaaoortT3i2DLk61ZvxxwtmczZ9M1";
    let url = 'https://api.map.baidu.com/geocoder?key=' +key+'&location=' + latitude + ',' + longitude + '&output=json';
    wx.request({
      url: url,
      data : {},
      method:"GET",
      // header: {
      //   'Content-Type': 'application/json',
      // },
      success:function(res){
        console.log("获取城市",res)
        if(res.statusCode == 200 && res.data.result != 'undefined'){
          let city = res.data.result.addressComponent.city;
          _this.setData({ cityName: city })
          app.cityInfo.realCity = city
          app.cityInfo.cityName = city
          app.cityInfo.cityAddress = res.data.result.formatted_address
          if (city === '成都市'){
            app.cityInfo.realCityId = 1
            app.cityInfo.cityId = 1
            _this.data.cityId = 1
          } else if (city === '重庆市'){
            app.cityInfo.realCityId = 2
            app.cityInfo.cityId = 2
            _this.data.cityId = 2
          }else{
            app.cityInfo.realCityId = 0
            app.cityInfo.cityId = 0
            _this.data.cityId = 0
            app.cityInfo.openCity = false
            _this.setData({ noFitnessText: "陛下别走，我们还有健身视频哟~", noFitnessImg : app.img.notOpenImg, cityId : 0 })
            wx.showModal({
              title: '',
              content: '当前城市覆盖中，敬请期待~',
              showCancel: false,
              confirmColor: '#28d7cc',
            })
          }
          if (!userCity)_this.saveUserInfo(city)
          _this.fuzzySearch(_this.data.searchId)
        }
      }
    })
  },

  /**
  * 跳转地图页面
  */
  mapPage: function(){
    wx.navigateTo({
      url: '/pages/index/map/map',
    })
  },
  //跳转切换城市页面
  changeCity(){
    wx.navigateTo({
      url: '/pages/index/changeCity/changeCity?longitude=' + this.data.longitude + "&latitude=" + this.data.latitude,
    })
  },
  /**
  * 获取健身房列表
  */
  getIndexList: function (longitude, latitude, fitnessTypeId){
    let _this = this;
    let data = {
      longitude: longitude,
      latitude: latitude,
      fitnessTypeId: fitnessTypeId,
      pageNumber: this.data.pageNumber,
      advertCity: this.data.cityId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log("获取广告等参数",data)
    app.wxApi.wxPost("api-fitness/fitness/getFitnessIndex",data)
    .then( res => {
      console.log("广告，附近活动列表",res);
      if(res.statusCode == 200 && res.data.code ==1){
        let data = _this.data.sType;
        let nearActivity = [];
        if (res.data.nearby && res.data.nearby.length > 0) nearActivity = res.data.nearby;
        if (data.length == 0) {
          for (let i = 0; i < res.data.fitnessType.length; i++) {
            res.data.fitnessType[i].checked = false;
            data.push(res.data.fitnessType[i])
          }
          data[0].checked = true;
        }
        _this.setData({
          advertImg: res.data.banners,
          nearActivity: nearActivity,
          sType: data,
        })
      }else{
        app.Toast.Toast({ content: "网络错误，请稍后重试..." })
      }
    })
  },
  //跳转到健身房详情页、或跳转外部链接
  jumpOtherPage(e){
    console.log(e)
    let urlType = e.currentTarget.dataset.type 
    let url = e.currentTarget.dataset.url
    var reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    //let num = e.currentTarget.data.num
    if (urlType == 1){
      if(reg.test(url)){
        wx.showModal({
          title: '',
          content: '请下载“纯氧健身”app查看',
          showCancel:false
        })
        // wx.navigateTo({
        //   url: "/pages/index/outPage/outPage?url=" + url,
        // })
      }else{
        app.common.showToast("网址错误")
      }
    }   
    if (urlType == 2){
      if (!url || reg.test(url)){
        app.common.showToast("健身房信息有误")
        return false
      }
      wx.navigateTo({
        url: "/pages/index/detail/detail?fitnessNumber=" + url,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      fitness: [],
      pageNumber: 1,
      //loadMore: true,
      count:0,
    })
    this.fuzzySearch( this.data.searchId)
    this.getIndexList(this.data.longitude, this.data.latitude, this.data.searchId)
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let _this = this
    let count = this.data.count
    //let loadMore = this.data.loadMore
    let length = this.data.fitness.length
    if (count > length){
      //触底加载更多数据
      this.setData({ loading: true })
      this.data.pageNumber ++ 
      this.fuzzySearch(this.data.searchId)
      setTimeout(() => {
        _this.setData({ loading: false })
      }, 6000)
    }
  },
  //小程序分享
  onShareAppMessage: function (res) {
    return {
      title: "这么豪华的健身房居然这么便宜",
      imageUrl: app.img.shareImage,
      path: '/pages/index/userLogin/userLogin?type=test',
    }
  },
  //切换城市通知，更新数据
  switchCityInform(data){
    console.log("切换城市参数",data)
    let noFitnessText = ''
    let noFitnessImg = ''
    let realCityId = app.cityInfo.cityId
    let openCity = app.cityInfo.openCity

    app.cityInfo.cityId = data.cityId
    app.cityInfo.cityName = data.cityName
    app.cityInfo.longitude = data.longitude
    app.cityInfo.latitude = data.latitude
    if (data.cityId === 0 && !openCity){
      data.longitude = app.cityInfo.realLongitude
      data.latitude = app.cityInfo.realLatitude
    }
    //没有健身房时，文本提示内容
    if (data.cityId > 0) {
      noFitnessText = '暂时没有健身房'
      noFitnessImg = app.img.noFitnessImg
    } else {
      noFitnessText = "陛下别走，我们还有健身视频哟~",
      noFitnessImg = app.img.notOpenImg
    }
    this.setData({
      cityName: data.cityName,
      cityId: data.cityId,
      longitude: data.longitude,
      latitude: data.latitude,
      noFitnessText: noFitnessText,
      noFitnessImg: noFitnessImg,
      fitness: [],
      pageNumber: 1,
      loadMore: true,
      advertImg: [],
    })
    this.getIndexList(data.longitude, data.latitude, this.data.searchId);
    if(this.data.fitness.length == 0)this.fuzzySearch(this.data.searchId)
  },
  onUnload: function () {
    //移除通知
    var that = this
    app.wxNotice.removeNotification('noticeName', that)
  },
  //图片加载完成
  loadSuccess(e){
    let fitness = this.data.fitness
    let num = e.currentTarget.dataset.number
    if(fitness.length>0)
    {
      for (let i = 0; i < fitness.length;i++)
      {
        if (num == fitness[i].fitnessNumber)
        {
          fitness[i].success = true
          this.setData({ fitness: fitness})
          break;
        }
      }
    }
  },
  /**
   * 保存用户所在城市
   */
  saveUserInfo(city) {
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "city": city,
    }
    console.log(data)
    app.wxApi.wxPost("api-user/user/updateUserMsg", data)
      .then(res => {
        console.log("保存用户城市",res)
        if (res.statusCode == 200) {

        }
      })
  },
  powerDrawer: function (e) {
    var Status = e.currentTarget.dataset.statu;
    if (Status == 'open') {
      this.setData({ showModalStatus: true })
    } else {
      this.setData({ showModalStatus: false })
    }
    //app.common.animation(currentStatu, this)
  },
  //设置页之后的回调
  openSettingPage(e){
    let _this = this
    _this.setData({ showModalStatus: false })
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userLocation']){
          _this.userLocation()
        }
      }
    })
  },
  //获取用户openid方法
  getOpenid: function (code) {
    let data = {
      appid: "wxef18586487ff0f14",
      secret: "d5b000f3816cf2bfb1d038be173e2a90",
      grant_type: 'authorization_code',
      js_code: code
    }
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode == 200) {
          //保存用户openid
          app.common.storage("openid", res.data.openid)
        }
      }
    })
  },
  //获取用户位置
  userLocation(){
    let _this = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("获取用户位置",res)
        var gcj02tobd09 = location.gcj02tobd09(res.longitude, res.latitude);
        let longitude = gcj02tobd09[0];
        let latitude = gcj02tobd09[1];

        //存储经纬度
        app.cityInfo.longitude = longitude
        app.cityInfo.latitude = latitude

        app.cityInfo.realLongitude = longitude
        app.cityInfo.realLatitude = latitude

        _this.setData({ latitude: latitude, longitude: longitude, fitness: [], pageNumber: 1 })
        _this.getIndexList(longitude, latitude, _this.data.searchId);
        _this.getCity(latitude, longitude);
        
      },
      fail: function (res) {
        _this.data.getLocation = true
        _this.getIndexList(_this.data.longitude, _this.data.latitude, _this.data.searchId);
        _this.fuzzySearch(_this.data.searchId)
      },
      complete: function(res){
      }
    })
  },

  //微信登录  smallOpenId
  wechatLogin() {
    let _this = this
    let data = { 
      smallOpenId: app.common.getStorage("openid"), 
      unionid: app.common.getStorage("unionid"), 
      userNumber: app.common.getStorage("userNumber"), 
      oneLogin: false 
    }
    console.log(data)
    app.wxApi.wxPost("api-user/login/weChatLogin", data)
      .then(res => {
        console.log("微信登录", res)
        app.userMsg.userInfo = res.data.data
        app.userMsg.tokenNumber = res.data.data.tokenNumber;
        app.userMsg.userNumber = res.data.data.userNumber;
      })
  },
  //跳转课程首页
  jumpCoursePage(){
    let noFitnessImg = this.data.noFitnessImg
    let notOpenImg = app.img.notOpenImg
    if (noFitnessImg === notOpenImg){
      wx.switchTab({
        url: '/pages/course/course',
      })
    }
  },
  //点击tabBar
  onTabItemTap(item) {
    let nowPage = app.globalData.nowPage
    if (nowPage === 'index'){
      //回到顶部
      wx.pageScrollTo({
        scrollTop: 0
      })
    }else{
      app.globalData.nowPage = 'index'
      return false
    }
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    let _this = this
    //app.common.getNetWork(app)
    wx.getSetting({
      success:function(res){
        if (!res.authSetting['scope.userLocation'] && _this.data.getLocation){   
          wx.showModal({
            title: '',
            content: '需要您的位置才能获取您附近已合作健身房，是否去授权？',
            success: function(res){
              if(res.confirm){
                _this.setData({ showModalStatus: true })
              }
            }
          })
        }
      }
    })
  },
})
