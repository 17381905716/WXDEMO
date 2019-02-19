const { $Toast } = require('../../../dist/base/index.js');
var location = require('../../../utils/dingwei.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    pageNumber: 1,
    count: 0,
    current_tab: 0,
    height: 0,
    scrollTop: 0,
    loadMore: true,
    noOrderData: false, //是否有订单数据
    waring: "/images/index/pay_icon_war@3x.png",
    order: "/images/index/pay_icon_shop@3x.png",

    address: "/images/index/home_icon_ad@3x.png",
    address2: "/images/public/home_icon_city_ad@3x.png",

    askImg1: "/images/my/myorder_icon_help_t@3x.png",
    askImg2: "/images/my/myorder_icon_help_yes@3x.png",
    nameImg1: "/images/my/myorder_icon_shop@3x.png",
    nameImg2: "/images/my/myorder_icon_shop_ye@3x.png",
    addressImg1: "/images/my/myorder_icon_ad@3x.png",
    addressImg2: "/images/my/myorder_icon_add_yes@3x.png",

    cancelImg: "/images/my/myorder_icon_can@3x.png",
    refundImg: "/images/my/myorder_icon_re@3x.png",
    successImg: "/images/my/myorder_icon_succ@3x.png",

    useImg1: "/images/public/myorder_icon_help_li@3x.png",
    useImg2: "/images/public/myorder_icon_li_re@3x.png",
    orderData: [],
    orderType: [  /// 订单类型（默认1 2已支付 3退款 4已消费（待评价）5已完成）
      { name: "全部订单", type: 0 },
      { name: "待消费", type: 2 },
      { name: "待评价", type: 4 },
      { name: "已完成", type: 5 },
      { name: "已退款", type: 3 },
    ]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("我的订单");
    this.getOrderList(this.data.current_tab);
  },
  //获取订单列表
  getOrderList(buyServiceType) {
    let _this = this;
    console.log(app.userMsg)
    let data = {
      buyServiceType: buyServiceType,
      pageNumber: this.data.pageNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber
    }
    console.log(data)
    app.wxApi.wxPost("api-pay/order/getMyOrders", data)
      .then(res => {
        console.log("订单数据", res)
        //return false
        if (res.statusCode == 200) {
          if (res.data.code == 10030) _this.setData({ noOrderData: true })
          if (res.data.code == 1) {
            let array = _this.data.orderData
            let order = res.data.data
            if (order == null || order.length < 10) this.setData({ loadMore: false })
            if (order.length == 10) this.data.pageNumber++;
            if (order.length > 0) {
              for (let i = 0; i < order.length; i++) {
                /// 默认1，2为已支付，3为已退款，4为已消费
                if (order[i].buyServiceType == 1) order[i].statusImg = ''
                if (order[i].buyServiceType == 2) order[i].statusImg = ''
                if (order[i].buyServiceType == 4) order[i].statusImg = ''
                if (order[i].buyServiceType == 3) order[i].statusImg = this.data.refundImg
                if (order[i].buyServiceType == 5) order[i].statusImg = this.data.successImg
                order[i].payServiceMoney = Number(order[i].payServiceMoney).toFixed(2)
                order[i].useStopTime = order[i].useStopTime.substring(0, 10)
                array.push(order[i])
              }
              this.setData({ orderData: array, noOrderData: false, count: res.data.count })
            }
          } else {
            //$Toast({ content : res.data.msg })
          }
        }
      })
  },
  //显示订单帮助
  powerDrawer: function (e) {
    console.log(e)
    let status = e.currentTarget.dataset.statu;
    let id = e.currentTarget.dataset.id;
    let helpData = {}
    let explain = []
    let data = this.data.orderData
    if (status == 'open') {
      //显示订单帮助数据
      for (let i = 0; i < data.length; i++) {
        data[i].useStartTime = data[i].useStartTime.substring(0, 10)
        data[i].useStopTime = data[i].useStopTime.substring(0, 10)
        if (id == data[i].buyServiceId) {
          helpData = data[i]
          explain = data[i].activeExplainNexus
          let vipDiscounts = "0.00"
          let represent = helpData.fitnessActivityDescription

          data[i].payServiceMoney = Number(data[i].payServiceMoney).toFixed(2)
          if (app.userMsg.userInfo.vipType == 1) {
            vipDiscounts = Number(Math.ceil(data[i].payServiceMoney * (1 - app.userMsg.userInfo.leaguerCardDiscount) * 100) / 100).toFixed(2)
          }
          if (represent == null) helpData.represent = []
          if (represent) helpData.represent = represent.split("\\n")
          helpData.vipDiscounts = vipDiscounts
          break;
        }
      }
      if (explain.length > 0) {
        for (let i = 0; i < explain.length; i++) {
          let array = explain[i].useExplainValue.split("&")
          explain[i].textArr = array
        }
        //this.setData({ useExplain: explain })
      }
      helpData.explain = explain
      this.setData({ showModalStatus: true, helpData: helpData, height: app.globalData.screenHeight })
      console.log(this.data.helpData)
    } else {
      this.setData({ showModalStatus: false, height: 0 })
    }
    //app.common.animation(status, this)
  },
  //订单进行退款  
  orderRefund(e) {
    console.log(e)
    let _this = this
    let orderData = _this.data.orderData
    let id = e.currentTarget.dataset.id
    let num = e.currentTarget.dataset.num
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      "buyServiceNumber": num,
      "buyServiceId": id,
      openId: app.common.getStorage("openid")

    }
    console.log("退款参数", data)
    wx.showModal({
      title: '提示',
      content: '你确定要取消订单吗？',
      success: function (result) {
        console.log(result)
        if (result.confirm) {
          $Toast({ content: '', type: 'loading' })
          app.wxApi.wxPost("api-pay/extract/payRefund", data)
            .then(res => {
              $Toast.hide()
              console.log(res)
              if (res.statusCode == 200) {
                if (res.data.code == 1) {
                  $Toast({ content: res.data.msg })
                  _this.setData({
                    orderData: [],
                    pageNumber: 1,
                    loadMore: true,
                  })
                  _this.getOrderList(_this.data.current_tab)
                } else {
                  $Toast({ content: res.data.msg })
                }
              }
            })
        }
        //取消
        if (result.cancel) {
          console.log("取消了操作")
        }
      }
    })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {
  //   app.common.showToast("数据刷新中...")
  //   this.setData({
  //     orderData: [],
  //     pageNumber: 1,
  //     loadMore: true,
  //   })
  //   this.getOrderList(this.data.current_tab)
  //   setTimeout(() => {
  //     wx.stopPullDownRefresh()
  //   }, 1500)
  // },

  /**
   * 页面上拉触底事件的处理函数  onReachBottom
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.orderData.length
    if (this.data.loadMore && (length < count)) {
      this.getOrderList(this.data.current_tab)
    }
  },
  //订单类型选择
  changeScroll({ detail }) {

    if (detail.key == this.data.current_tab) {
      return false
    } else {
      this.setData({
        current_tab: detail.key,
        pageNumber: 1,
        loadMore: true,
        orderData: [],
      });
      this.getOrderList(detail.key)
    }
  },
  //评价订单所在健身房
  commentFitness(e) {
    let id = e.currentTarget.dataset.id
    let data = this.data.orderData
    for (let i = 0; i < data.length; i++) {
      if (id == data[i].buyServiceId) {
        app.common.storage("orderInfo", data[i])
        break;
      }
    }
    console.log(data, e)
    //app.common.storage("orderInfo", res.data.data)
    //return false
    wx.navigateTo({
      url: '/pages/my/orderVealuate/orderVealuate',
    })
  },
  /**
   * 再次购买订单，或跳转地图页面
   */
  buyAgain: function (e) {
    console.log(e)
    let detail = e.currentTarget.dataset
    let type = detail.type
    let num = detail.num
    if (type == 2) {
      let bd09togcj02 = location.bd09togcj02(detail.longitude, detail.latitude);
      wx.openLocation({
        longitude: bd09togcj02[0],
        latitude: bd09togcj02[1],
        name: detail.name, //名称
        address: detail.address, //地址
      });
    } else {  //跳转健身房详情页
      wx.navigateTo({
        url: '/pages/index/detail/detail?fitnessNumber=' + num + "&indexImg=''" ,
      })
    }
  },
  confirm(e) {
    console.log(e)
    this.setData({ showModalStatus: false })
  },
})