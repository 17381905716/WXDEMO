// pages/index/map/map.js
const app = getApp()

Page({
  data: { 
    detailShow: false,
    cityId: 1,
    cityName: "成都市",
    latitude: 30.55293,
    longitude: 104.0589,

    // latitude1: 30.55293,
    // longitude1: 104.0589,
    business: "/images/index/home_icon_bu_ing@3x.png",
    rest: "/images/index/home_icon_bu_n@3x.png",
    wait: "/images/index/home_icon_bu_wa@3x.png",
    fitness:[],
    detail: [],
    location: {},
    markers: [],
    polyline: [{
      points: [{
        longitude: 104.05899,
        latitude: 30.452675
      }, {
          longitude: 104.05899,
          latitude: 30.352675
      }],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    controls: []
  },
  regionchange(e) {
    //let markers = this.data.markers
    this.setData({ detailShow: false })
  },
  clickEvent(e){
    this.setData({ detailShow: false})
    // let markers = this.data.markers
    // if (markers.length > 0) {
    //   for (let i = 0; i < markers.length; i++) {
    //     if (e.markerId != markers[i].id) {
    //       markers[i].callout.display = "BYCLICK"
    //     }
    //   }
    //   this.setData({ markers: markers})
    // }
  },
  markertap(e) {
    let data = this.data.markers
    this.data.fitnessNumber = e.markerId
    let markers = this.data.markers
    if (markers.length > 0) {
      for (let i = 0; i < markers.length; i++) {
        if (e.markerId == markers[i].id) {
          //markers[i].callout.display = "ALWAYS"
          this.setData({ detail: markers[i],detailShow: true, })
          return false
        }
      }
      
    }
  },
  controltap(e) {
  },
  // 健身房详情页跳转
  toDetailPage(e){
    //let fitnessNumber = e.currentTarget.dataset.fitnessNumber
    wx.navigateTo({
      url: '/pages/index/detail/detail?fitnessNumber=' + this.data.fitnessNumber ,
    })
  },
  // 城市页面跳转
  cityPage(){
    wx.navigateTo({
      url: '/pages/index/changeCity/changeCity?latitude=' + this.data.latitude + "&longitude=" + this.data.longitude,
    })
  },
  putKeyword(e){
    wx.getSuggestion({
      keyword: '技术',
      success: function (res) {
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // let pages = getCurrentPages();
    // let prevPage = pages[pages.length - 2];   //上个页面
    // this.data.latitude = prevPage.data.latitude
    // this.data.longitude = prevPage.data.longitude
    // this.data.latitude1 = prevPage.data.latitude
    // this.data.longitude1 = prevPage.data.longitude
    this.setData({
      latitude: app.cityInfo.latitude,
      longitude: app.cityInfo.longitude,
      cityId:app.cityInfo.cityId,
      cityName: app.cityInfo.cityName,
      controls: [{
        id: 1,
        iconPath: "/images/index/home_icon_map_my@3x.png",
        position: {
          left: app.globalData.screenWidth / 2,
          top: app.globalData.windowHeight / 2 - 80,
          width: 23,
          height: 34,
        },
        clickable: true
      }]
    })
  },
  //选择位置
  chooseLocation: function (e) {
    var that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          hasLocation: true,
          location: {
            longitude: res.longitude,
            latitude: res.latitude,
            address: res.address,
            name:res.name,
          }
        })
        //刷新健身房列表数据
        //that.getFitnessList(res.longitude, res.latitude,that.data.cityId)
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

  /**
* 获取健身房列表
*/
  getFitnessList: function (longitude, latitude,cityId) {
    let _this = this;
    let data = {
      longitude: longitude,
      latitude: latitude,
      fitnessTypeId: 1,
      pageNumber: 0,
      advertCity: cityId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    console.log("地图页获取健身房参数",data)
    app.wxApi.wxPost("api-fitness/fitness/getFitnessList", data)
      .then(res => {
        console.log("地图页获取健身房列表数据", res)
        let fitness = res.data.data;
        if(fitness.length>0){
          _this.data.markers = []
          for (let i = 0; i < fitness.length; i++) {
            let statusImg = ''
            if (fitness[i].stateBusiness == 1) fitness[i].statusImg = this.data.business
            if (fitness[i].stateBusiness == 2) fitness[i].statusImg = this.data.rest
            if (fitness[i].stateBusiness == 3) fitness[i].statusImg = this.data.wait
            _this.data.markers.push({
              iconPath: app.img.markImg,
              id: fitness[i].fitnessNumber,
              latitude: fitness[i].fitnessLatitude,
              longitude: fitness[i].fitnessLongitude,
              fitnessName: fitness[i].fitnessName,
              fitnessAddress: fitness[i].fitnessAddress, // startBusiness  stopBusiness 
              startBusiness: fitness[i].startBusiness,
              stopBusiness: fitness[i].stopBusiness,
              statusImg: fitness[i].statusImg,
              distance: Number(fitness[i].distance).toFixed(1),
              width: 30,
              height: 37,
              // callout: {
              //   content: fitness[i].fitnessName + '（' + statusText + '）\n营业时间：（' + fitness[i].startBusiness + '-' + fitness[i].stopBusiness + '）\n地址：' + fitness[i].fitnessAddress + "\n距离：" + fitness[i].distance.toFixed(1)+"千米",
              //   width: 330,
              //   height: 80,
              //   color: '#ffffff',
              //   bgColor: '#28d7cc',
              //   fontSize: 14,
              //   padding: 5,
              //   borderRadius: 20,
              //   //display: 'BYCLICK',
              //   display: 'ALWAYS'
              // }
            })
          }
          _this.setData({
            markers: _this.data.markers,
          })
        }
        
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //数据为空时，获取健身房数据
    //if (this.data.markers == '')
    this.getFitnessList(this.data.longitude, this.data.latitude, this.data.cityId)
  },
})