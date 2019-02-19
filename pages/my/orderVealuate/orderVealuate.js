const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num : 0,
    disabled: true,
    // address2: "/images/public/home_icon_city_ad@3x.png",
    askImg2: "/images/my/myorder_icon_help_yes@3x.png",
    nameImg2: "/images/my/myorder_icon_shop_ye@3x.png",
    addressImg2: "/images/my/myorder_icon_add_yes@3x.png",

    waring: "/images/index/pay_icon_war@3x.png",
    order: "/images/index/pay_icon_shop@3x.png",
    address2: "/images/public/home_icon_city_ad@3x.png",

    useImg2: "/images/public/myorder_icon_li_re@3x.png",

    addImg: "/images/public/found_icon_pl_add@3x.png",
    deleteImg: "/images/public/found_icon_pl_cl@2x.png",

    starImg: app.img.starImg,
    noStarImg: app.img.noStarImg,
    array :[0,1,2,3,4],
    // typeArr: ["环境设施", "服务态度", "教练专业度","性价比"],
    typeArr: [
      { name: "环境设施",num: 0, type : 1 },
      { name: "服务态度", num: 0, type: 2 },
      { name: "教练专业度", num: 0, type: 3 },
      { name: "性价比", num: 0, type: 4 },
    ],
    imgList: [],
    orderInfo: "",
    helpData: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let fitnessName = app.common.getStorage("orderInfo").fitnessName
    app.common.navTitle(fitnessName)
    this.setData({ orderInfo: app.common.getStorage("orderInfo")})
    console.log(app.common.getStorage("orderInfo"))
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  //统计字数
  getCont: function (e) {

    let val = e.detail.value;
    let that = this;
    let len = 0;
    let disabled = true
    if (val.length > 0) {
      disabled = false
      len = val.length;
      if (len >= 500) len = 500;
    }
    that.setData({
      num: len,
      disabled: disabled
    });
    return val.substring(0, 500);
  },
  //选择星星
  checkedStar(e){
    console.log(e)
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let data = this.data.typeArr
    for (let i = 0; i < data.length; i++){
      if (type == data[i].type){
        data[i].num = Number(index + 1)
        this.setData({ typeArr: data})
        break;
      }
    }
  },
  // 选择图片  api-media/upload/fileUpload
  chooseImage: function () {
    let _this = this
    //选择图片
    wx.chooseImage({
      count: 3,
      success: function (res) {
        //wx.clearStorage()
        console.log(res);
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          _this.uploadFile(res.tempFilePaths[i])
        }
      },
    })
  },
  //上传视频、或图片（type为1是图片，为2上传视频）
  uploadFile(filePath) {
    let _this = this
    let result = [];
    let url = app.wxApi.upUrl + "fileUpload";
    if (filePath == null || filePath.length == 0) return false
    app.common.showLoading("上传中...")
    wx.uploadFile({
      url: url,
      filePath: filePath, //res.tempFilePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data",
      },
      success: function (result) {
        console.log(result);
        if (result.statusCode == 200) {
          let res = JSON.parse(result.data)
          console.log(res);
          if (res.code == 1) {
            let data = _this.data.imgList
            data.push(res.data)
            _this.setData({ imgList: data })
            app.common.hideLoading()
            console.log(_this.data)

          } else {
            app.common.hideLoading()
            app.Toast.Toast({ content: "请勿上传有敏感信息的图片，已为您删除" })
          }
        }
      },
    })
  },
  //预览大图片
  previewImage() {
    let data = this.data.imgList
    console.log(data)
    if (!data || data == null || data.length == 0) {
      return false
    } else {
      wx.previewImage({
        urls: data,
      })
    }
  },
  //删除所选择的图片 
  deleteImg(e) {
    console.log(e)
    let newImgList = []
    let imgList = this.data.imgList
    let imgSrc = e.currentTarget.dataset.imgsrc
    for (let i = 0; i < imgList.length; i++) {
      if (imgSrc != imgList[i]) {
        newImgList.push(imgList[i])
      }
    }
    this.setData({ imgList: newImgList })
    console.log(this.data.imgList)
  },
  //保存评价
  saveVealuate(e){
    let _this = this
    var img1 ='', img2 = '', img3 = '';
    let imgList = this.data.imgList
    let typeArr = this.data.typeArr
    let orderInfo = this.data.orderInfo
    let value = e.detail.value.content
    if (imgList.length>0){
      if (imgList[0]) img1 = imgList[0]
      if (imgList[1]) img2 = imgList[1]
      if (imgList[2]) img3 = imgList[2]
    }
    if (!value){
      app.Toast.Toast({ content: "请输入评论内容" })
      return false
    }
    if (typeArr.length>0){
      // typeArr: ["环境设施", "服务态度", "教练专业度","性价比"],
      for (let i = 0; i < typeArr.length; i++ ){
        let msg = ''
        if (typeArr[i].type == 1) msg = "请选择环境设施评分"
        if (typeArr[i].type == 2) msg = "请选择服务态度评分"
        if (typeArr[i].type == 3) msg = "请选择教练专业度评分"
        if (typeArr[i].type == 4) msg = "请选择性价比评分"
        if (typeArr[i].num ==0){
          app.Toast.Toast({ content: msg })
          return false
        }
      }
    }
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      text: value,
      //parentId: 0,
      fitnessNumber: orderInfo.fitnessNumber,
      orderNumber: orderInfo.buyServiceNumber,
      level1: typeArr[0].num,
      level2: typeArr[1].num,
      level3: typeArr[2].num,
      level4: typeArr[3].num,
      img1: img1,
      img2: img2,
      img3: img3,
    }
    this.setData({ disabled: true })
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
    .then(res => {
      console.log("文件检测结果", res)
      if (res.statusCode == 200) {
        this.setData({ disabled: false })
        if (res.data.code == 10037) {
          app.Toast.Toast({ content: res.data.msg })
          return false
        }
        if (res.data.code == 1) {
          this.setData({ disabled: true })
          console.log(data)
          app.wxApi.wxPost("api-fitness/comment/comment", data)
          .then(res => {
            app.Toast.Toast({ content: res.data.msg })
            setTimeout(()=>{
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 2];   //上一个页面
              prevPage.setData({ orderData: [], loadMore: true, pageNumber:1})
              prevPage.getOrderList(prevPage.data.current_tab); //刷新页面数据
              _this.setData({ disabled: false })
              wx.navigateBack({
                delta: 1
              })
            },500)
          })
        }
      }
    })
  },
  //显示订单帮助
  powerDrawer: function (e) {
    let status = e.currentTarget.dataset.statu;
    let orderInfo = this.data.orderInfo
    let vipDiscounts = "0.00"
    if (app.userMsg.userInfo.vipType == 1) {
      vipDiscounts = Number(Math.ceil(orderInfo.payServiceMoney * (1 - app.userMsg.userInfo.leaguerCardDiscount) * 100) / 100).toFixed(2)
    }
    if (status == 'open') {
      this.setData({ showModalStatus: true, helpData: orderInfo })
    } else {
      this.setData({ showModalStatus: false })
    }
  },
})