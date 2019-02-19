// pages/index/detail/detail.js
const app = getApp();
var location = require('../../../utils/dingwei.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    lastX: 0, //滑动开始x轴位置
    lastY: 0, //滑动开始y轴位置
    slidDir: '',
    currentGesture: 0, //标识手势
    fitnessPhone : '',
    shareTitle: '',
    shareImg: '',
    vipBgImg: app.img.vipBgImg,
    noDataImg1: app.img.noDataImg1,
    edit: "/images/index/detail/edit.png",
    mark: "/images/index/detail/mark.png",
    mapMark: "/images/index/detail/myPhoto.png",
    phone: "/images/index/detail/phone.png",
    activityImg: "/images/index/detail/activity.png", 
    rightImg:"/images/public/gym_icon_vip@3x.png",
    useImg2: "/images/public/myorder_icon_li_re@3x.png",
    starImg: app.img.starImg,
    noStarImg: app.img.noStarImg,
    noHeadImg: app.img.noHeadImg,
    imgType: 0, //
    shareImage: '',
    fitnessNumber : '',
    indexImg: '',
    // server: [
    //   { img: "/images/index/detail/server1.png", cont: "举重" },
    //   { img: "/images/index/detail/server2.png", cont: "淋浴" },
    //   { img: "/images/index/detail/server3.png", cont: "瑜伽" },
    //   { img: "/images/index/detail/server4.png", cont: "跑步机" },
    // ],
    array: [0, 1, 2, 3, 4],
    bannerImg: [],
    imgTypeText:[],
    fitnessData: {},
    commentList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let indexImg = ''
    if (options.indexImg) indexImg = options.indexImg
    if (typeof options.indexImg === 'undefined') indexImg = app.img.noDataImg1
    this.setData({ fitnessNumber: options.fitnessNumber, indexImg: indexImg})
    app.common.navTitle("健身房详情")
    app.common.storage('voucherList', [])
    app.common.storage('voucherDetail', [])
  },
  /**
   * 拨打电话
   */
  callPhone: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.fitnessPhone,
    })
  },
  /**
   * 跳转位置详情，地图页面
   */
  toMapPage: function() {
    var bd09togcj02 = location.bd09togcj02(this.data.fitnessData.fitnessLongitude, this.data.fitnessData.fitnessLatitude);
    wx.openLocation({
      longitude: bd09togcj02[0],
      latitude: bd09togcj02[1],
      name: this.data.fitnessData.fitnessName, //名称
      address: this.data.fitnessData.fitnessAddress, //地址
    });
  },

  /**
   * 获取健身房详情
   */
  fitnessDetail:function(){
    let _this = this;
    let data = {
      fitnessNumber: this.data.fitnessNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-fitness/fitness/getFitness", data)
    .then( res => {
      console.log("健身房详情",res)
      //图片类型（1外景2前台3健身区4休息区5其他）
      let fitnessData = res.data.data
      let imgData = res.data.data.fitnessImgs;
      let imgTypeText = []
      let activity = res.data.data.fitnessActivities
      if (activity.length > 0){
        for (let i = 0; i < activity.length;i++){
          activity[i].fitnessActivityPrice = activity[i].fitnessActivityPrice.toFixed(2)
        }
      }
      if (!fitnessData.level) fitnessData.level = 0
      fitnessData.level = Math.round(fitnessData.level)
      //更新部分数据
      _this.setData({
        fitnessData: fitnessData,
        fitnessPhone: res.data.data.fitnessPhone,
      })
      if (imgData.length > 0){
        for (let i = 0; i < imgData.length; i++) {
          imgData[i].imgType = imgData[i].fitnessImgType
          imgData[i].show = false
          imgData[0].show = true
          //{ text: "前台", imgType:"", isShow:true }
          if (imgData[i].fitnessImgType == 1) {
            imgTypeText.push({ imgType: 1, text: "外景", checked: false })
          }
          if (imgData[i].fitnessImgType == 2) {
            imgTypeText.push({ imgType: 2, text: "前台", checked: false })
          }
          if (imgData[i].fitnessImgType == 3) {
            imgTypeText.push({ imgType: 3, text: "健身区", checked: false })
          }
          if (imgData[i].fitnessImgType == 4) {
            imgTypeText.push({ imgType: 4, text: "休息区", checked: false })
          }
          if (imgData[i].fitnessImgType == 5) {
            imgTypeText.push({ imgType: 5, text: "其他", checked: false })
          }
        }
      }
      //数组去重
      imgTypeText = _this.arrayDistinct(imgTypeText)
      imgTypeText[0].checked = true
      imgData = _this.arraySort(imgData)
      _this.setData({
        bannerImg: imgData,  //arraySorts数组排序
        imgTypeText: _this.arraySort(imgTypeText),
        imgType: res.data.data.fitnessImgs[0].fitnessImgType,
        shareImg: imgData[0].fitnessImgUrl,
        shareTitle: '【' + fitnessData.fitnessName + '】这么豪华的健身房居然这么便宜。地址：' + fitnessData.fitnessAddress + '（' + fitnessData.fitnessPhone + '）'
      })
    })
  },

  //滑动移动事件
  handletouchmove: function(event) {
    let idx = event.currentTarget.dataset.index;
    let currentX = event.touches[0].pageX
    let currentY = event.touches[0].pageY
    let tx = currentX - this.data.lastX
    let ty = currentY - this.data.lastY
    let slidDir = ''
    //左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        slidDir = 'left'
      } else if (tx > 0) {
        slidDir = 'right'
      }

    }
    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX
    this.data.lastY = currentY
    this.setData({
      slidDir: slidDir
    });
  },

  //滑动开始事件
  handletouchtart: function(event) {
    this.data.lastX = event.touches[0].pageX
    this.data.lastY = event.touches[0].pageY

  },
  //滑动结束事件
  handletouchend: function(event) {
    let arr = this.data.bannerImg;
    let textData = this.data.imgTypeText
    let imgTypeNum = this.data.imgType
    this.data.currentGesture = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].show == true) {
        //左滑逻辑处理
        if (this.data.slidDir == 'left') {
          if (i < arr.length - 1) {
            arr[i].show = false;
            arr[i + 1].show = true;
            if(arr[i + 1].imgType)imgTypeNum = arr[i + 1].imgType
            this.setData({
              imgType: arr[i + 1].imgType,
            })
            break;
          }
        }
        //右滑逻辑处理
        if (this.data.slidDir == 'right') {          
          if (i > 0) {
            arr[i].show = false;
            arr[i - 1].show = true;
            if (arr[i - 1].imgType) imgTypeNum = arr[i - 1].imgType
            this.setData({
              imgType: arr[i - 1].imgType,
            })
            break;
          }
        }
      }
    }
    //显示图片所属类型，更改文字状态颜色
    for (let j = 0; j < textData.length; j++) {
      if (imgTypeNum == textData[j].imgType) {
        textData[j].checked = true
      } else {
        textData[j].checked = false
      }
    }
    this.setData({
      slidDir: '',
      bannerImg: arr,
      imgTypeText: textData,
    });
  },
  //参加活动，进行余额或微信充值
  buyActive: function(e) {
    let money = e.currentTarget.dataset.money;
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    let depict = e.currentTarget.dataset.depict
    let starttime = (e.currentTarget.dataset.starttime).substring(0,10)
    let endtime = (e.currentTarget.dataset.endtime).substring(0, 10)
    let fitness = this.data.fitnessData
    let activity = this.data.fitnessData.fitnessActivities
    let factMoney = money
    if (app.userMsg.userInfo.vipType == 1) factMoney = Number(money * app.userMsg.userInfo.leaguerCardDiscount).toFixed(2)
    if (activity.length > 0){
      for (let i = 0; i < activity.length;i++){
        if (id == activity[i].fitnessActivityId){
          app.common.storage("useExplain", activity[i].activeExplainNexuses) //存使用说明
          break;
        }
      }
    }

    let data = {
      fitnessNumber: this.data.fitnessNumber,
      fitnessActivityId: id,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      vipType: app.userMsg.userInfo.vipType,
    }
    console.log("下单参数", data)
    app.wxApi.wxPost("api-pay/extract/buyServices", data)
      .then(res => {
        console.log("生成订单信息", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          let voucherMoney = 0
          //let factMoney = this.data.factMoney
          let voucherDetail = []
          let list = res.data.data.coupon
          if (list.length > 0) {
            if (list[0].money) {
              voucherMoney = Number(factMoney - list[0].money).toFixed(2)
            }
            for (let i = 0; i < list.length; i++) {
              list[i].checked = false
              list[i].money = Number(list[i].money).toFixed(2)
              // list[i].aeadTime = list[i].aeadTime.slice(0, 10)
              // if (list[i].aeadStartTime)list[i].aeadStartTime = list[i].aeadStartTime.slice(0, 10)
            }
            list[0].checked = true
            app.common.storage('voucherList', list)
            voucherDetail = list[0]
          }
          if (voucherMoney == 0) voucherMoney = factMoney
          app.common.storage('voucherDetail', voucherDetail)
          // this.setData({
          //   serverData: res.data.data.orderBuyService,
          //   //voucherDetail: voucherDetail,
          //   //factMoney: factMoney,
          //   voucherMoney: voucherMoney,
          // })
          //跳转支付订单页
          wx.navigateTo({
            url: "/pages/index/payOrder/payOrder?id=" + id + "&money=" + money + "&name=" + name + "&depict=" + depict + "&starttime=" + starttime + "&endtime=" + endtime + "&fitnessName=" + fitness.fitnessName + "&fitnessAddress=" + fitness.fitnessAddress + "&fitnessNumber=" + fitness.fitnessNumber + "&voucherMoney=" + voucherMoney + "&orderBuyService=" + res.data.data.orderBuyService.buyServiceNumber,
          })
        } else {
          app.Toast.Toast({ content: res.data.msg })
        }
      })
  },
  //跳转购买会员卡页面
  buyCardPage(){
    wx.navigateTo({
      url: '/pages/my/buyCard/buyCard',
    })
  },
  //图片切换
  switchImage(e){
    let imgType = e.detail.currentItemId
    let textData = this.data.imgTypeText
    if (textData.length > 0){
      for(let i = 0 ;i < textData.length; i++){
        if (imgType == textData[i].imgType){
          textData[i].checked = true
        }else{
          textData[i].checked = false
        }
      }
      this.setData({ imgTypeText: textData })
    }
  },
  //顶部图片点击文字类型切换
  checkShowImg(e){
    let imgType = e.currentTarget.dataset.type
    let textData = this.data.imgTypeText
    let data = this.data.bannerImg
    //显示的图片
    if(data.length>0){
      for(let i=0;i<data.length;i++){
        data[i].show = false
      }
      for (let j = 0; j < data.length; j++) {
        if (imgType == data[j].imgType) {
          data[j].show = true
          break;
        }
      }
    }
    for (let i = 0; i < textData.length; i++) {
      if (imgType == textData[i].imgType) {
        textData[i].checked = true
      } else {
        textData[i].checked = false
      }
    }
    this.setData({ imgTypeText: textData, bannerImg: data})
  },
  //顶部图片排序---相同类型图片连续一起
  arraySort(arr){
    if (arr.length <= 0) return arr;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j].imgType > arr[j + 1].imgType) {
          var temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
    return arr;
  },
  //数组去重
  arrayDistinct(array){
    if (array.length <= 0) return array;
    let arr = [];
    let result = []
    arr.push(array[0].imgType)
    result.push(array[0])
    if(array.length<=0)return false;
    for (let i = 0;i<array.length;i++){
      for (let j = 0; j < arr.length; j++){
        if (arr.indexOf(array[i].imgType) < 0){
          arr.push(array[i].imgType);
          result.push(array[i])
        }
      }
    }
    return result;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showLoading("数据刷新中···")
    this.fitnessDetail();
    this.commentList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      app.common.hideLoading()
    }, 1500)
  },
  //分享
  onShareAppMessage: function (res) {
    return {
      title: this.data.shareTitle,
      path: '/pages/index/userLogin/userLogin',
      imageUrl: this.data.shareImg,
    }
  },
  //预览轮播大图片
  previewImage() {
    let array = []
    let data = this.data.bannerImg
    console.log(data)
    if (!data || data == null || data.length == 0) {
      return false
    } else {
      for (let i = 0; i < data.length; i++) {
        if (data[i].fitnessImgUrl) array.push(data[i].fitnessImgUrl)
      }
      wx.previewImage({
        urls: array,
      })
    }
  },
  //获取健身房评论列表
  commentList(){
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      pageNum:1,
      pageSize:10,
      fitnessNumber: this.data.fitnessNumber
    }
    app.wxApi.wxPost("api-fitness/comment/queryComment",data)
    .then( res => {
      console.log("健身房评论",res)
      let list = res.data.data
      //let oldList = this.data.commentList
      if(list && list.length > 0){
        for (let i = 0; i < list.length;i++){
          if (!list[i].level) list[i].level = 0
          list[i].level = Math.round(list[i].level)
        }
      }
      this.setData({ commentList: list, count: res.data.count })
    })
  },


  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },
  //预览评论大图片
  previewCommentImage(e) {
    let array = []
    let cid = e.currentTarget.dataset.cid
    let data = this.data.commentList
    for (let i = 0; i < data.length; i++) {
      if(cid == data[i].cid){
        if (data[i].img1) array.push(data[i].img1)
        if (data[i].img2) array.push(data[i].img2)
        if (data[i].img3) array.push(data[i].img3)
      }
      //if (data[i].fitnessImgUrl) array.push(data[i].fitnessImgUrl)
    }
    wx.previewImage({
      urls: array,
    })
  },
  //收藏店铺
  cellectShop(e) {
    let _this = this
    let fitness = _this.data.fitnessData
    //let num = e.currentTarget.dataset.num
    let collect = e.currentTarget.dataset.collect //为1已收藏，为0未收藏
    let data = {
      collectUserNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      passiveCollect: this.data.fitnessNumber, //健身房编号
      collectType: 4,
    }
    console.log(data, collect)
    app.common.collect(app, data, collect, this); // 收藏店铺
  },
  /**
 * 购买服务活动详情
 */
  activityDetail(id) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.common.storage('voucherDetail', [])
    this.fitnessDetail();
    this.commentList()
  },
})