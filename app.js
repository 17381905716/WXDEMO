const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
const Toast = require('/dist/base/index.js');

var WxNotificationCenter = require('/utils/WxNotificationCenter.js')
var wxApi = require("/utils/wxApi.js");
var common = require("/common/common.js"); 

// let appid = "wxef18586487ff0f14"
// let secret = "d5b000f3816cf2bfb1d038be173e2a90"
App({
  onLaunch: function () {
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })

    //获取手机信息
    let wxGetSystemInfo = wxApi.wxGetSystemInfo();
    wxGetSystemInfo().then( res =>{
      console.log("系统信息",res)
      if (res.brand != 'iPhone'){
        res.brand = (res.brand).toLowerCase()
      } 
      console.log(res.brand)
      this.globalData.screenWidth = res.screenWidth
      this.globalData.screenHeight = res.screenHeight
      this.globalData.windowHeight = res.windowHeight
      let scale = Number(res.screenHeight / res.screenWidth);
      if (scale > 2){
        this.globalData.longScreen = true
      }
    })
  },
  globalData: {
    userInfo: null,
    longScreen : false,
    screenHeight: 0,
    screenWidth: 0,
    windowHeight:0,
    nowPage: "index",
  },
  // fun: {
  //   wxApi: wxApi,
  //   common: common
  // },
  Toast: Toast, // 交互提示信息
  wxApi:wxApi,  //接口获取数据方法
  common: common,  //普通方法
  wxNotice: WxNotificationCenter, //广播通知
  cityInfo: {
    longitude: 0,
    latitude: 0,
    cityId: 0,
    cityName: "成都市",
    cityAddress: '川威大厦',
    realCity: '',
    realCityId: 0,
    realLongitude: 0,
    realLatitude: 0,
    openCity: true,
  },
  userMsg:{
    tokenNumber:'',
    userNumber:'',
    userInfo:'',
  },
  // 定义全局使用的小图片
  img:{
    vipCrown: "/images/public/vip_s@2x.png",
    noHeadImg: "/images/public/my_img_hrad@2x.png",
    hotImg: "/images/public/hot@2x.png",
    downImg:"/images/index/home_icon_city@3x.png",
    comment: "/images/public/course_icon_de_tv_com@3x.png",
    halfStar: "/images/public/course_icon_co@3x.png",
    fullStar: "/images/public/course_icon_de_tv_co_se@3x.png",
    halfLike: "/images/public/course_icon_good@3x.png",
    fullLike: "/images/public/course_icon_de_tv_good_se@3x.png",
    playImg: "/images/public/course_icon_tv@3x.png",
    playBtn: "/images/public/found_icon_de_pl@3x.png",
    tickChecked: "/images/my/rech_icon_se@3x.png",
    checked: "/images/public/course_icon_de_tv_vid_se@3x.png",
    noChecked: "/images/public/course_icon_de_tv_vid_d@3x.png",
    markImg: "/images/index/home_icon_map_gym@3x.png", //home_icon_map_gym@3x.png
    walletBgImg: "http://jsf-file.wenqi.xin/img/d5453d3cb0c34cc99ef5c6ee45fe728a.png",
    inviteImg: "http://jsf-file.wenqi.xin/img/8e47fe59f01247cc8ce35c02bcc48654.png",
    redPacketImg: "http://jsf-file.wenqi.xin/img/a55091b7866849afbe3d7d50409d2741.png",
    vipBgImg: "http://jsf-file.wenqi.xin/img/8c3500121d914292aef58e6658639bc3.png",
    myWalletImg: "http://jsf-file.wenqi.xin/img/f7ed9901c74c4e5184048a9d9f3375c1.png",
    myInfoBg: "http://jsf-file.wenqi.xin/img/fb22248c5694466985d51b5263ed6682.png",
    myMember: "http://jsf-file.wenqi.xin/img/cfd875c42a4041699609f2e1985b7638.png",
    shareImage: "http://jsf-file.wenqi.xin/img/939bddc27bfc4030ac3c3a99c4e4877b.jpg",
    noDataImg1: "/images/public/placeholderfigure_f@2x.png",
    noDataImg2: "/images/public/placeholderfigure_t@2x.png",
    orderImg: "/images/my/rech_icon_peo@3x.png",
    noFitnessImg: "/images/index/home_icon_gym_no@3x.png",
    notOpenImg: '/images/public/home_icon_city_no@2x.png',
    memberImg: "/images/public/my_icon_head_vip_i@2x.png",
    starImg: "/images/public/gym_icon_star@2x.png",
    noStarImg: "/images/public/myorder_icon_star_de@2x.png",
    orderBg1: "http://jsf-file.wenqi.xin/img/8e202d7bdf334fcc9f1fd6fb33609dac.png",
    orderBg2: "http://jsf-file.wenqi.xin/img/aec1aacf619741eebfa59b219014f390.png",
  },
})