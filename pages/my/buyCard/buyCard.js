
const { $Toast } = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0,
    balance: 0,
    vipSpareDay: 0,
    leaguerCardId: 0,
    originalPrice: 0,
    vipType: 0,
    payMethod: 3,
    hotImg: app.img.hotImg,
    checked: app.img.tickChecked,
    noChecked: app.img.noChecked,
    waring: "/images/index/pay_icon_war@3x.png",
    waring: "/images/index/pay_icon_war@3x.png",
    payType: [
      { img: '/images/public/pay_icon_m@3x.png', payMethod: 3, text: "余额支付", checked: true },
      { img: '/images/public/pay_icon_we@3x.png', payMethod: 2, text: "微信支付", checked: false },
    ],
    cardData:[
      // { leaguerCardId: 1, leaguerCardName: "年会员卡1", leaguerCardMoney: 120, checked: true },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("购买会员卡")
    let payType = this.data.payType
    let payMethod = this.data.payMethod
    if (Number(app.userMsg.userInfo.balance) <= 0){
      for(let i = 0; i < payType.length; i++ ){
        payType[i].checked = false
      }
      payType[1].checked = true
      payMethod = 2
    }
    this.setData({ vipType: app.userMsg.userInfo.vipType, vipSpareDay: app.userMsg.userInfo.vipSpareDay, balance: app.userMsg.userInfo.balance, payType: payType, payMethod: payMethod })
  },

  /**
   * 选择充值金额
   */
  selectMoney(e){
    let originalPrice = 0
    let index = e.currentTarget.dataset.index 
    let id = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money 
    let data = this.data.cardData;
    for(let i=0;i<data.length;i++){
      if (data[i].leaguerCardId == id){
        data[i].checked = true;
        originalPrice = data[i].originalPrice
      }else{
        data[i].checked = false;
      }
    }
    this.setData({ cardData: data, leaguerCardId: id, money: money, originalPrice: originalPrice})
  },
  /**
  * 选择支付方式
  */
  checkPayType(e) {
    let index = e.currentTarget.dataset.index  
    let method = e.currentTarget.dataset.method 
    let data = this.data.payType;
    let status = data[index].checked;
    if (index ===0){
      if (Number(app.userMsg.userInfo.balance) <= 0){
        $Toast({ content : "余额不足" })
        return false
      }
    }
    for (let i = 0; i < data.length; i++) {
      if (i == index) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    this.setData({ payType: data, payMethod: method })
  },
  //获取会员卡数据
  getCardData(){
    let _this = this
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/user/getRechargeList", data )
    .then( res =>{
      console.log(res)
      if(res.statusCode == 200 && res.data.data.length>0){
        for(let i = 0;i<res.data.data.length;i++){
          res.data.data[i].checked = false
          res.data.data[i].leaguerCardMoney = res.data.data[i].leaguerCardMoney.toFixed(2)
          if (res.data.data[i].originalPrice)res.data.data[i].originalPrice = res.data.data[i].originalPrice.toFixed(2)
        }
        res.data.data[0].checked = true
        _this.setData({ cardData: res.data.data, money: res.data.data[0].leaguerCardMoney, leaguerCardId: res.data.data[0].leaguerCardId, originalPrice: res.data.data[0].originalPrice})
      }
    })
  },
  //支付购买会员阿卡
  buyVipCard(){
    console.log(app.common.getStorage("openid"))
    let _this = this
    let payMethod = this.data.payMethod
    let data = {
      openId: app.common.getStorage("openid"),
      "payMethod": payMethod, //支付方式（1支付宝 2微信 3钱包）
      "orderType": 2, //充值类型（1充值 2购买会员卡，3购买服务）
      "money": this.data.money,
      "orderNumber": "", //购买服务传订单编号，充值或者买会员卡传空字符串
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "vipType": app.userMsg.userInfo.vipType,
      leaguerCardId: this.data.leaguerCardId,  //会员卡对应id
    }
    if (!data.openId) data.openId = app.userMsg.openId
    //余额支付
    if (payMethod == 3) {
      if (Number(this.data.money) > Number(this.data.balance)) {
        $Toast({
          content: '余额不足，请选择微信支付'
        });
        return false
      }
    }
    wx.showModal({
      title: '提示',
      content: '确定支付' + this.data.money + "元进行充值吗？",
      success: function (res) {
        if(res.confirm){
          $Toast({ content : '', type : "loading"})
          //app.common.showLoading("")
          app.wxApi.wxPost("api-pay/extract/userRecharge", data)
            .then(res => {
              console.log(res)
              $Toast.hide();
              //app.common.hideLoading()
              if (res.statusCode == 200 && res.data.code == 1) {
                //余额支付
                if (payMethod == 3) {
                  _this.getUserInfo()
                  wx.navigateTo({
                    url: '/pages/index/payResult/payResult?status=1&pType=back',
                  })
                  return false
                }
                //微信支付
                if (payMethod == 2) {
                  wx.requestPayment(
                    {
                      'timeStamp': res.data.data.timeStamp,
                      'nonceStr': res.data.data.nonceStr,
                      'package': res.data.data.package,
                      'signType': 'MD5',
                      'paySign': res.data.data.sign,
                      'success': function (res) {
                        console.log(res)
                        _this.getUserInfo()
                        wx.navigateTo({
                          url: '/pages/index/payResult/payResult?status=1&pType=back',
                        })
                      },
                      'fail': function (res) {
                        $Toast({ content: '支付失败' });
                      },
                      'complete': function (res) { }
                    })
                }
              } else {
                $Toast({ content: res.data.msg });
              }
            })
        }
      }
    })    
    
  },
  // 查看历史记录
  lookRecord(){
    wx.navigateTo({
      url: '/pages/my/historyRecord/historyRecord?pageType=buyCard',
    })
  },
  //获取用户信息  
  getUserInfo() {
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-user/user/getUserAccount", data)
      .then(res => {
        console.log("用户信息", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          // res.data.data.balance = res.data.data.balance.toFixed(2)
          // res.data.data.redPacketMoney = res.data.data.redPacketMoney.toFixed(2)
          app.userMsg.userInfo = res.data.data
          // res.data.data.vipSpareDay = 5
          // res.data.data.vipType = 1
          this.setData({
            vipSpareDay: res.data.data.vipSpareDay,
            vipType: res.data.data.vipType
          })
        }
      })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.getCardData()
  },
})