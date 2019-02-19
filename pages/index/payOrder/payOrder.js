const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useExplain: [],
    depict:[], 
    //serverData: [],
    //voucherData:[],
    voucherDetail: [],
    activityId: 0,
    money: 0,
    factMoney: 0,
    vipDiscounts: 0.00,
    payMethod: 3,
    balance: 0,
    voucherMoney: 0,
    inciteMoney : "0.00",  // 鼓励金减少金额
    //memberMoney: "0.00",  //会员折扣金额
    status: 'close',
    showMoneyDetail: false,
    //activityName: '',
    checked: app.img.tickChecked,
    noChecked: app.img.noChecked,
    waring: "/images/index/pay_icon_war@3x.png",
    order: "/images/index/pay_icon_shop@3x.png",
    address: "/images/index/home_icon_ad@3x.png",
    useImg2: "/images/public/myorder_icon_li_re@3x.png",
    downImg: '/images/public/pay_icon_war_d@2x.png',
    upImg: "/images/public/pay_icon_war_t@2x.png",
    payType: [
      { img: '/images/public/pay_icon_m@3x.png', text: "余额支付", payMethod: 3, checked: true },
      { img: '/images/public/pay_icon_we@3x.png', text: "微信支付", payMethod: 2, checked: false },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("父页面传参",options)
    app.common.navTitle("支付订单")
    let voucherMoney = "0.00"
    let vipDiscounts = "0.00"
    let userData = app.userMsg.userInfo
    let money = Number(options.money).toFixed(2)
    let balance = Number(userData.balance).toFixed(2)
    let inciteMoney = (Number((options.voucherMoney *100) / 6).toFixed(0)) / 100 ;
    let factMoney = money
    let payType = this.data.payType
    if (Number(inciteMoney) > Number(userData.redPacketMoney)) inciteMoney = Number(userData.redPacketMoney).toFixed(2)
    voucherMoney = Number(options.voucherMoney - inciteMoney).toFixed(2)
    
    if (options.money == 0) payType =  [this.data.payType[0]] //只显示余额支付
    if (userData.vipType == 1){ //是会员
      factMoney = Number(money * userData.leaguerCardDiscount).toFixed(2)
      vipDiscounts = Number(money * (1 - userData.leaguerCardDiscount)).toFixed(2)
    }
    this.setData({ servers: options, voucherMoney: voucherMoney, money: money, inciteMoney: inciteMoney, balance: balance, factMoney: factMoney, vipDiscounts: vipDiscounts, payType: payType, depict: options.depict.split("\\n"), })
    this.useExplain() //订单使用说明 拼装
  },
  /**
   * 选择支付方式
   */
  checkPayType(e){
    let payMethod = e.currentTarget.dataset.method
    let index = e.currentTarget.dataset.index
    let data = this.data.payType;
    let status = data[index].checked;
    
    for(let i=0;i<data.length;i++){
      if(i == index){
        data[i].checked = true;
      }else{
        data[i].checked = false;
      }
    }
    this.setData({ payType: data, payMethod: payMethod})
  },

  //支付方法
  nowPayMoney(){
    let _this = this
    let payMethod = this.data.payMethod
    let voucherDetail = app.common.getStorage('voucherDetail')
    let data = {
      openId: app.common.getStorage("openid"),
      "payMethod": payMethod, //支付方式（1支付宝 2微信 3钱包）
      "orderType": 3, //充值类型（1充值 2购买会员卡，3购买服务）
      "money": this.data.voucherMoney,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "orderNumber": this.data.servers.orderBuyService, //购买服务传，购买服务传单独接口生成订单，次数需要 
      "fitnessActivityId": this.data.servers.id,
      "vipType": app.userMsg.userInfo.vipType,
      //couponId: voucherDetail.id,
    }
    if (!data.openId) data.openId = app.userMsg.openId
    if (voucherDetail && voucherDetail.couponUserId > 0){
      data.couponUserId = voucherDetail.couponUserId
    }
    console.log("order下单参数", data)
    //余额支付
    if (payMethod == 3 && this.data.voucherMoney > 0){
      if (Number(this.data.voucherMoney) > Number(this.data.balance)){
        $Toast({
          content: '余额不足，请选择微信支付'
        });
        return false
      }
    }
    wx.showModal({
      title: '提示',
      content: '确定支付' + this.data.voucherMoney+"元，购买该服务吗？",
      success:function(res){
        if(res.confirm){
          $Toast({ content: '', type: "loading" })
          app.wxApi.wxPost("api-pay/extract/userRecharge", data)
            .then(res => {
              $Toast.hide()
              console.log("结果", res)
              if (res.statusCode == 200 && res.data.code == 1) {
                //余额支付
                if (payMethod == 3) {
                  //this.data.balance = Number(this.data.balance - this.data.factMoney)
                  wx.reLaunch({
                    url: '/pages/index/payResult/payResult?status=1&pType=jump',
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
                        //_this.getUserInfo()
                        wx.reLaunch({
                          url: '/pages/index/payResult/payResult?status=1&pType=jump',
                        })
                      },
                      'fail': function (res) {
                        $Toast({ content: '支付失败！' });
                      },
                      'complete': function (res) { }
                    }
                  )
                }
              } else {
                wx.navigateTo({
                  url: '/pages/index/payResult/payResult?status=0&pType=""',
                })
              }
            })
        }
      }
    })
  },

  //订单使用说明
  useExplain(){
    let explain = app.common.getStorage("useExplain")
    console.log(explain)
    if (explain.length > 0){
      for (let i = 0; i < explain.length; i++ ){
        let array = explain[i].useExplainValue.split("&")
        explain[i].textArr = array
      }
      this.setData({ useExplain: explain })
    }
  },
  //显示、隐藏优惠券使用明细
  useVoucher(e){
    let status = e.currentTarget.dataset.status
    if (status == 'close'){
      this.setData({ showMoneyDetail: true, status: 'open' })
    }else{
      this.setData({ showMoneyDetail: false, status: 'close' })
    }
    
  },
  //跳转选择优惠券
  toUseVoucher(){
    this.setData({ showMoneyDetail : false })
    wx.navigateTo({
      url: '/pages/index/useVoucher/useVoucher',
    })
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    this.setData({ voucherDetail: app.common.getStorage('voucherDetail')})
  },
})