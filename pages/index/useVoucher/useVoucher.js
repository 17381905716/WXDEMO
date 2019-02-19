const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    orderBg1: app.img.orderBg1,
    orderBg2: app.img.orderBg2,
    notCheckImg: "/images/public/course_icon_de_tv_vid_d@3x.png",
    checkImg: "/images/public/payment_icon_x@2x.png",
    notVoucher: "/images/my/coupon_icon_no@2x.png",
    list : [],
    enabled: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("选择优惠券")
    let enabled = false
    let list = app.common.getStorage('voucherList')
    console.log("优惠券",list)
    if (list && list.length > 0 ) enabled = true
    this.setData({ list: list, enabled: enabled})
    if (!enabled && list.length==0){
      this.getVoucherList()
    }
  },
  //选择优惠券
  checkVoucher(e){
    let id= e.currentTarget.dataset.id
    let list = this.data.list
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];   //上一个页面
    let money = prevPage.data.money

    let enabled = this.data.enabled
    if (!enabled){
      app.Toast.Toast({ content : "支付金额不满足满减不能使用该优惠券" })
      return false
    }
    for(let i = 0; i< list.length; i ++ ){
      if (id==list[i].couponUserId){
        list[i].checked = true
        app.common.storage('voucherDetail',list[i])

        let voucherMoney = 0
        let inciteMoney = "0.00"
        let vipType = app.userMsg.userInfo.vipType
        let redPacketMoney = app.userMsg.userInfo.redPacketMoney
        //let voucherDetail = app.common.getStorage('voucherDetail')
        if (vipType == 1) {
          voucherMoney =  Number((money * 0.9) - list[i].money).toFixed(2)
        } else {
          voucherMoney = Number(money - list[i].money).toFixed(2)
        }
        inciteMoney = Number(voucherMoney / 6).toFixed(2)
        if (Number(inciteMoney) > Number(redPacketMoney)) inciteMoney = Number(redPacketMoney).toFixed(2)
        voucherMoney = Number(voucherMoney - inciteMoney).toFixed(2)
        //增加鼓励金计算
        // let inciteMoney = Number(options.voucherMoney / 6).toFixed(2)
        // let voucherMoney = 0
        // if (Number(inciteMoney) > Number(userData.redPacketMoney)) inciteMoney = Number(userData.redPacketMoney).toFixed(2)
        // voucherMoney = Number(options.voucherMoney - inciteMoney).toFixed(2)

        prevPage.setData({
          voucherDetail: list[i],
          voucherMoney: voucherMoney,
          inciteMoney: inciteMoney,
        })
        wx.navigateBack({
          delta:1
        })
      }else{
        list[i].checked = false
      }
    }
    app.common.storage('voucherList', list) // 缓存优惠券列表
    this.setData({ list:list })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
    let count = this.data.count
    let length = this.data.list.length
    let enabled = this.data.enabled
    if (!enabled &&  (count > length)) {
      //触底加载更多数据
      this.data.pageNumber++
      this.getVoucherList()
    }
  },
  // 获取优惠券列表
  getVoucherList() {
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      "pageNumber": this.data.pageNumber,
      "pageSize": 10,
      "phoneNumber": app.userMsg.userInfo.phoneNumber,
      "status": 1,
    }
    app.wxApi.wxPost("api-user/user/getCoupon", data)
      .then(res => {
        console.log("获取优惠券列表", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          let array = this.data.list
          let list = res.data.data
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].money = Number(list[i].money).toFixed(2)
              // list[i].aeadTime = list[i].aeadTime.slice(0, 10)
              // list[i].aeadStartTime = list[i].aeadStartTime.slice(0, 10)
              array.push(list[i])
            }
          }
          this.setData({ list: array, count: res.data.count })
        } else {
          app.Toast.Toast({ content: res.data.msg })
        }
      })
  },
})