const { $Toast } = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    orderId: 0,
    redPacketNum: 0,
    lock: false,
    longScreen: false,
    alreadyUsed: false,
    showModalStatus: false,
    longScreen: app.globalData.longScreen, 
    redPacketImg: app.img.redPacketImg,
    tickChecked: app.img.tickChecked,
    noChecked: app.img.noChecked,
    nameImg2: "/images/my/myorder_icon_shop_ye@3x.png",
    addressImg2: "/images/my/myorder_icon_add_yes@3x.png",
    closeImg: "/images/public/myorder_icon_cl@3x.png",
    useImg2: "/images/public/myorder_icon_li_re@3x.png",
    startTime: '',
    endTime: '',
    buyServiceNumber: '',
    activeTypeName: '',
    orderData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("使用订单")
    let orderData = app.common.getStorage("orderData")
    console.log(orderData)
    for (let i = 0; i < orderData.length;i++){
      orderData[i].payServiceMoney = Number(orderData[i].payServiceMoney).toFixed(2)
      orderData[i].checked = false
    }
    console.log(orderData)
    orderData[0].checked = true
    let startTime = orderData[0].useStartTime.substring(0,10)
    let endTime = orderData[0].useStopTime.substring(0, 10)
    this.setData({ orderData: orderData, buyServiceNumber: orderData[0].buyServiceNumber, activeTypeName: orderData[0].fitnessActivityName, startTime: startTime, endTime: endTime})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 选择使用订单
   */
  checkedOrder(e) {
    console.log(e)
    let _this = this
    let startTime = ''
    let endTime = ''
    let id = e.currentTarget.dataset.id
    let num = e.currentTarget.dataset.num
    let data = this.data.orderData;
    let activeTypeName = ''
    for(let i = 0 ; i < data.length; i++){
      if (id == data[i].buyServiceId){
        data[i].checked = true
        startTime = data[i].useStartTime.substring(0,10)
        endTime = data[i].useStopTime.substring(0, 10);
        activeTypeName = data[i].fitnessActivityName
      }else{
        data[i].checked = false
      }
    }
    this.setData({ buyServiceNumber: num, activeTypeName: activeTypeName, orderData: data})
    
  },
  powerDrawer: function (e) {
    let _this = this 
    var currentStatu = e.currentTarget.dataset.statu;
    app.common.animation(currentStatu, this)
    if (currentStatu == "close"){
      //更新订单数据，去掉已使用的订单
      let newOrder = []
      let orderData = _this.data.orderData
      for (let i = 0; i < orderData.length; i++) {
        if (orderData[i].buyServiceNumber && (orderData[i].buyServiceNumber != _this.data.buyServiceNumber)) {
          newOrder.push(orderData[i])
        }
      }
      _this.setData({ orderData: newOrder, buyServiceNumber: '' })
      //回到扫码首页
      wx.navigateBack({
        delta: 1
      })
    }
  },
  //拆红包，获得奖励
  getMoney: function () {
    console.log("拆红包，获得奖励")
    this.data.num ++
    this.animation1 = wx.createAnimation()
    this.animation1.rotateY(this.data.num * 360).step()
    this.setData({ animation1: this.animation1.export()})
    this.getRedPacket()
  },
  //拆红包  
  getRedPacket(){
    let lock = this.data.lock
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    if (lock)return false
    this.data.lock = true
    app.wxApi.wxPost("api-pay/order/getRandomRedPacket", data)
      .then(res => {
        this.data.lock = false
        console.log("拆红包结果", res)
        if(res.statusCode == 200 && res.data.code ==1){
          this.setData({ alreadyUsed: true, redPacketNum: Number(res.data.data.money).toFixed(2)})
        }
      })
  },
  //回到扫码页面
  backScanPage(){
    if (!this.data.alreadyUsed)this.getRedPacket()
    setTimeout(function(){
      // wx.switchTab({
      //   url: '/pages/scan/scan',
      // })
      wx.navigateBack({
        delta:1
      })
    },300)
  },
  /**
   * 确定使用订单
   */
  useOrder(){
    let _this = this
    let buyServiceNumber = this.data.buyServiceNumber;
    let activeTypeName = this.data.activeTypeName
    let data = {
      buyServiceNumber: buyServiceNumber,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "nickName" :app.userMsg.userInfo.nickName,
      "activeTypeName": activeTypeName,
    }
    if (!buyServiceNumber){
      app.common.showToast("请选择使用订单")
      return false
    }
    console.log("使用订单参数",data)
    wx.showModal({
      title: '提示',
      content: '确定使用该订单吗？',
      success: function (res) {
        if (res.confirm) {
          $Toast({ content : '' ,type: 'loading' })
          app.wxApi.wxPost("api-pay/order/commitOrder", data)
            .then(res => {
              $Toast.hide()
              console.log("使用订单结果", res)
              if (res.statusCode == 200 && res.data.code == 1) {
                _this.setData({ showModalStatus: true })
              }else{
                $Toast({ content : res.data.msg})
              }
            })
        }
      }
    })
    
  },
})