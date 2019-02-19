const { $Toast } = require('../../../dist/base/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeMoney:0, 
    chargeMoneyId:0,
    giveCardId:0,
    giveListId:0,
    balance: 0,
    showModalStatus: false,
    checkedImg: app.img.tickChecked,
    noCheckedImg: app.img.noChecked,
    orderImg: app.img.orderImg,
    closeImg: "/images/my/c_icon_pl_cl@2x.png",
    moneyData: [
      { chargeMoneyId: 1, chargeMoney: 0, checked: true },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("充值")
  },
  /**
   * 充值协议
   */
  lookAgreement(){
    this.setData({ showModalStatus: true })
  },
  agreement(){
    this.setData({ showModalStatus: false })
  },
  /**
   * 选择充值金额
   */
  selectMoney(e) {
    let data = this.data.moneyData;
    let mid = e.currentTarget.dataset.mid;
    let cid = e.currentTarget.dataset.cid;
    let gid = e.currentTarget.dataset.gid;

    let rechargeMoney = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i].chargeMoneyId == mid) {
        data[i].checked = true;
        rechargeMoney = data[i].chargeMoney 
      } else {
        data[i].checked = false;
      }
    }
    console.log(data)
    this.setData({ 
      moneyData: data, 
      rechargeMoney: Number(rechargeMoney).toFixed(2),
      chargeMoneyId: mid,
      giveCardId: cid,
      giveListId: gid

    })
  },

  powerDrawer: function (e) {
    console.log(e)
    let currentStatu = e.currentTarget.dataset.statu;
    app.common.animation(currentStatu,this)
  },
  //获取充值金额数据
  getMoneyData(){
    let _this = this
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-user/user/getChargeGiveList",data)
    .then( res =>{
      console.log(res)
      if(res.statusCode == 200 && res.data.data.length>0){
        for(let i =0;i<res.data.data.length;i++){
          res.data.data[i].chargeMoney = Number(res.data.data[i].chargeMoney).toFixed(2);
          res.data.data[i].checked = false
        }
        res.data.data[0].checked = true
        _this.setData({ 
          moneyData: res.data.data,
          rechargeMoney: res.data.data[0].chargeMoney,
          chargeMoneyId: res.data.data[0].chargeMoneyId,
          giveCardId: res.data.data[0].giveCardId,
          giveListId: res.data.data[0].giveListId,
        })
      }
    })
  },
  //进行充值
  recharge(){
    let _this = this
    let leaguerCardId = this.data.giveCardId
    if (leaguerCardId == null) leaguerCardId = 0
    console.log("openid", app.common.getStorage("openid"))
    let data = {
      openId: app.common.getStorage("openid"),
      "payMethod": 2, //支付方式（1支付宝 2微信 3钱包）
      "orderType": 1, //充值类型（1充值 2购买会员卡，3购买服务）
      "money": this.data.rechargeMoney,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      chargeMoneyId: this.data.chargeMoneyId, //奖励对应id
      leaguerCardId: leaguerCardId,  //会员卡对应id
      giveId: this.data.giveListId, //赠送金额对应id
      "orderNumber": '', //购买服务传，购买服务传单独接口生成订单，次数需要  api-pay/extract/userRecharge
    }
    console.log("充值参数",data)
    if (!data.openId) data.openId = app.userMsg.openId
    wx.showModal({
      title: '提示',
      content: '确定支付' + this.data.rechargeMoney + "元进行充值吗？",
      success: function (res) {
        if(res.confirm){
          //app.common.showLoading()
          $Toast({ content: '', type: "loading" })
          app.wxApi.wxPost("api-pay/extract/userRecharge", data)
            .then(res => {
              $Toast.hide()
              //app.common.hideLoading()
              console.log("结果", res)
              if (res.statusCode == 200 && res.data.code == 1) {
                wx.requestPayment(
                  {
                    'timeStamp': res.data.data.timeStamp,
                    'nonceStr': res.data.data.nonceStr,
                    'package': res.data.data.package,
                    'signType': 'MD5',
                    'paySign': res.data.data.sign,
                    'success': function (res) {
                      _this.getUserInfo()
                      // let balance = Number(_this.data.balance + _this.data.rechargeMoney).toFixed(2)
                      // _this.setData({ balance: balance})
                      //console.log(res)
                      // wx.navigateBack({
                      //   delta: 1,
                      // })
                      wx.navigateTo({
                        url: '/pages/index/payResult/payResult?status=1&pType=back',
                      })
                    },
                    'fail': function (res) {
                      $Toast({ content: '支付失败!'});
                    },
                    'complete': function (res) { }
                  }
                )
              }else{
                $Toast({ content: res.data.msg });
              }
            })
        }
      }
    })    
  },
  // 查看历史记录
  lookRecord() {
    wx.navigateTo({
      url: '/pages/my/historyRecord/historyRecord?pageType=recharge',
    })
  },
  //跳转充值页面
  agreementPage(){
    // let url = "http://manager.wenqi.xin:8080/views/html/recharge_association/recharge_association.html"
    // wx.navigateTo({
    //   url: '/pages/index/outPage/outPage?url=' + url,
    // })
    wx.navigateTo({
      url: '/pages/my/agreement/agreement',
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
          let balance = res.data.data.balance.toFixed(2)
          //res.data.data.redPacketMoney = res.data.data.redPacketMoney.toFixed(2)
          app.userMsg.userInfo = res.data.data
          this.setData({
            balance: balance,
            //userInfo: res.data.data
          })
        }
      })
  },
  //打开兑换小窗口
  openChange(e){
    let status = e.currentTarget.dataset.status
    if (status == 'open'){
      this.setData({ showChange: true })
    }else{
      this.setData({ showChange: false})
    }
  },
  //确定进行兑换
  enterChange(e){
    let code = e.detail.value.code
    let changecode = e.detail.value.changecode
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "cardCode": code,
      "cardPasswd": changecode
    }
    if (!code){
      app.Toast.Toast({ content : "请输入编码" })
      return false
    }else{
      if(code.length != 12 ){
        app.Toast.Toast({ content: "请输入正确的编码" })
        return false
      }
    }
    if (!changecode) {
      app.Toast.Toast({ content: "请输入兑换码" })
      return false
    }else{
      if (changecode.length != 6) {
        app.Toast.Toast({ content: "请输入正确的兑换码" })
        return false
      }
    }
    app.wxApi.wxPost("api-user/other/useExchangeCard",data)
    .then( res => {
      console.log("兑换结果",res)
      app.Toast.Toast({ content: res.data.msg })
      if(res.statusCode == 200 && res.data.code ==1){
        //app.Toast.Toast({ content : res.data.msg })
        this.setData({ showChange: false })
        //重新获取用户余额
        this.getUserInfo()
      }
    })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.setData({ balance: Number(app.userMsg.userInfo.balance).toFixed(2) })
    this.getMoneyData()
  },
})