
const app = getApp()
const { $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    pageType: '',  //  buyCard
    pageNumber: 1,
    loadMore: true,
    listData : [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let title = ''
    let pageType = options.pageType;
    if (pageType == 'recharge') title = "充值记录"
    if (pageType == 'buyCard') title = "购买记录"
    app.common.navTitle(title)
    this.setData({ pageType: pageType})
    //$Toast({ content:"纯氧健身：查看历史记录"})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.listData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    $Toast({ content:"数据刷新中..."})
    this.setData({
      listData: [],
      pageNumber: 1,
      loadMore: true,
    })
    this.listData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      app.common.hideLoading()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.loadMore){
      this.listData()
    }
  },
  //获取充值、购买会员卡数据
  listData(){
    let fun = ''
    let pageType = this.data.pageType;
    let data = {
      pageNumber: this.data.pageNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    if (pageType == "recharge") fun = "api-pay/order/getRechargeOrder" //充值记录
    if (pageType == "buyCard") fun = "api-pay/order/getVipOrder"  //购买会员卡记录
    app.wxApi.wxPost(fun,data)
    .then( res => {
      if(res.statusCode == 200){
        console.log(res)
        let record = res.data.data
        if(res.data.code ==1){
          if (record == null || record.length == 0) this.setData({ noData:true})
          if (record == null || record.length < 10 )this.setData({ loadMore: false})
          if ( record.length == 10) this.data.pageNumber ++ 
          if (record.length>0){
            let array = this.data.listData
            if (pageType == 'recharge'){
              for (let i = 0; i < record.length; i++) { 
                record[i].payMoney = record[i].payMoney.toFixed(2)
                record[i].payTime = record[i].payRechargeTime
                record[i].successText = "充值成功" 
                record[i].payTimeText = "充值时间" 
                if (record[i].payRechargeMethod == 1) record[i].payText = "支付宝支付"
                if (record[i].payRechargeMethod == 2) record[i].payText = "微信充值"
                if (record[i].payRechargeMethod == 3) {
                  record[i].payText = "充值卡充值"
                  record[i].successText = "兑换成功"
                  record[i].payTimeText = "兑换时间" 
                }
                array.push(record[i])
              }
            }
            if (pageType == 'buyCard'){
              for (let i = 0; i < record.length; i++) {
                record[i].payMoney = record[i].payMoney.toFixed(2)
                record[i].payTime = record[i].payCardTime
                if (record[i].leaguerCardId == 1) record[i].payText = "月卡会员"
                if (record[i].leaguerCardId == 2) record[i].payText = "年卡会员"
                record[i].successText = "支付成功"
                record[i].payTimeText = "购买时间"
                // if (record[i].payCardMethod == 1) record[i].payText = "支付宝支付"
                // if (record[i].payCardMethod == 2) record[i].payText = "微信支付"
                // if (record[i].payCardMethod == 3) record[i].payText = "余额支付"
                array.push(record[i])
              }
            }
            this.setData({ listData: array})
          }
        }
        if (res.data.code == 10050){
          this.setData({ noData : true })
        }
      }else{

        $Toast({ content:res.data.msg})
      }
    })
  },
})