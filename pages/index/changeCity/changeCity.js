var location = require('../../../utils/dingwei.js')
const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityList: [],
    latitude: '',
    longitude: '',
    realCity: '',
    cityId: 0,
  },

  /**
   * 生命周期函数--监听页面加载  app.cityInfo.longitude
   */
  onLoad: function (options) {
    app.common.navTitle("选择城市")
    let city = app.cityInfo
    this.setData({ longitude: city.realLongitude, latitude: city.realLatitude, realCity: city.realCity, cityId: city.realCityId })
    this.getLocation()
    this.getCityList()
    
  },
  // 获取城市列表
  getCityList() {
    let _this = this
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-user/other/getCitys", data)
      .then(res => {
        _this.setData({ cityList: res.data.data })
      })
  },
  //城市切换
  changeCity(e){
    //let openCity = app.cityInfo.openCity
    let realId = this.data.cityId  // cityId
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 2];   //当前页面

    let longitude = 0
    let latitude = 0
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    
    console.log(currPage.data)

    if (id == realId){
      longitude = this.data.longitude
      latitude = this.data.latitude
    }else{
      longitude = e.currentTarget.dataset.longitude
      latitude = e.currentTarget.dataset.latitude
    }
    currPage.setData({ cityId: id, cityName: name, latitude: latitude, longitude: longitude })
    app.wxNotice.postNotificationName('noticeName', { cityId: Number(id), cityName: name, latitude: Number(latitude), longitude: Number(longitude) })
    wx.navigateBack({
      delta: 1
    }) 
  },
  //定位城市切换
  localCity(){

  },
  //获取当前城市的经纬度
  getLocation(){
    let _this = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var gcj02tobd09 = location.gcj02tobd09(res.longitude, res.latitude);
        let longitude = gcj02tobd09[0];
        let latitude = gcj02tobd09[1];
        //存储经纬度
        _this.data.longitude = gcj02tobd09[0]
        _this.data.latitude = gcj02tobd09[1]
      },
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //城市数据为空时去获取一次
    if (this.data.cityList == '')this.getCityList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})