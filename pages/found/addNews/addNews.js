const { $Toast } = require('../../../dist/base/index.js');
var location = require('../../../utils/dingwei.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num : 0,
    showAddress: true,
    showModalStatus: false,
    showAgreement: false,
    downImg: app.img.downImg,
    playBtn: app.img.playBtn,
    orderImg: app.img.orderImg,
    closeImg: "/images/public/login_icon_cl@3x.png",
    addressImg: "/images/dynamic/home_icon_ad_f@2x.png",
    headImg: '',
    index: 0,
    lock: false,
    //array: ['新动态','#减脂', '#瑜伽', '#话题', '#塑性'],
    newsType:[
      // { id: 0, name:'帖子类型', typeId: 0},
    ],
    typeId: 0,
    videoName: '',
    videoImgSrc: '',
    imgList : [],
    localImg : [],
    longitude:0,
    latitude:0,
    address: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.common.navTitle("新动态")
    //this.setData({ headImg: app.userMsg.userInfo.headImg, }) /// typeId: options.noteType
    let city = app.cityInfo
    this.setData({ longitude: city.longitude, latitude: city.latitude, address: city.cityAddress })
    //this.getLocation()
    this.getNewsType()
  },
  //获取经纬度
  getLocation() {
    let that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        var gcj02tobd09 = location.gcj02tobd09(res.longitude, res.latitude);
        let longitude = gcj02tobd09[0];
        let latitude = gcj02tobd09[1];
        //that.setData({ longitude: longitude, latitude: latitude})
        that.data.longitude = longitude
        that.data.latitude = latitude
        //that.data.address = res.address
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },
  //选择地址
  chooseAddress() {
    let that = this
    wx.chooseLocation({
      success: function (res) {
        console.log("地址选择",res)
        var gcj02tobd09 = location.gcj02tobd09(res.longitude, res.latitude);
        let longitude = gcj02tobd09[0];
        let latitude = gcj02tobd09[1];
        that.setData({ address: res.name, showAddress:true })
      },
    })
    // wx.openLocation({
    //   latitude: 30.578984,
    //   longitude: 104.072742,  //  
    // })
  },
  //查询帖子类型  
  getNewsType() {
    let _this = this
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-tribune/forumtype/getTypeList", data)
      .then(res => {
        console.log("查询帖子类型", res)
        if (res.statusCode == 200 && res.data.data.length > 0) {
          let index = 0;
          let newsType = _this.data.newsType
          if (newsType.length ==0){
            for (let i = 0; i < res.data.data.length; i++) {
              newsType.push(res.data.data[i])
            }
            for(let j = 0; j < newsType.length;j++){
              if (_this.data.typeId == newsType[j].typeId){
                index = j
                break
              }
            }
          }
          _this.setData({ newsType: newsType, index: index, typeId: res.data.data[0].typeId})
        }
      })
  },
  //选择帖子类型
  // newsTypeChange: function (e) {
  //   console.log( e)
  //   let index = e.detail.value
  //   this.setData({
  //     typeId: this.data.newsType[index].typeId, index: index
  //   })
  // },
  /**
   * 获取文本域内容，统计字数
   */
  getCont: function(e) {
    console.log(e)
    let val = e.detail.value;
    let that = this;
    let len = 0;
    if (val.length > 0) {
      len = val.length;
      if (len >= 500) len = 500;
    }
    that.setData({
      num: len
    });
    //replace(/(^\s*)|(\s*$)/g, "")  //  空格替换为空
    return val.replace(/\n/, "");
  },

  powerDrawer: function (e) {
    console.log(e)
    var currentStatu = e.currentTarget.dataset.statu;
    app.common.animation(currentStatu,this)
  },
  // 选择发布图片  api-media/upload/fileUpload
  chooseImage:function(){
    let _this = this
    app.common.animation("close", this)
    //选择图片
    wx.chooseImage({
      count: 6,
      success: function(res) {
        wx.clearStorage()
        console.log(res);
        for (let i = 0; i < res.tempFilePaths.length;i++){
          _this.uploadFile(res.tempFilePaths[i], 1)
        }
      },
    })
  },
  //图片本地保存
  // saveFile(filePath){
  //   console.log(app.common.getStorage("openid"))
  //   let _this = this
  //   let localImg = this.data.localImg
  //   wx.saveFile({
  //     tempFilePath: filePath,
  //     success:function(res){
  //       localImg.push(res.savedFilePath)
  //       _this.setData({ localImg: localImg })
  //     }
  //   })
  // },
  //选择上传视频 
  chooseVideo:function(){
    let _this = this
    app.common.animation("close", this)
    //选择视频---跳转提示下载app
    wx.navigateTo({
      url: '/pages/found/loadApp/loadApp',
    })
  },
  //上传视频、或图片（type为1是图片，为2上传视频）
  uploadFile(filePath,type){
    let _this = this
    let result = [];
    let url = app.wxApi.upUrl;
    if (type == 1 || type == 2) url += "fileUpload" //1是发布图片帖子，2是上传视频封面
    if (type == 3) url += "videoUpload" //视频
    if (filePath == null || filePath.length == 0)return false
    app.common.showLoading("上传中...")
    wx.uploadFile({
      url: url,
      filePath: filePath, //res.tempFilePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data",
      },
      success: function (result) {
        if(result.statusCode == 200){
          let res = JSON.parse(result.data)
          console.log(res);
          if(res.code == 1){
            if(type == 1 ){
              let data = _this.data.imgList
              data.push(res.data)
              _this.setData({ imgList: data, videoName: '', videoImgSrc:''})
              app.common.hideLoading()
            }
            if(type == 2){
              _this.setData({ videoImgSrc: res.data, imgList:[]})
            }
            if (type == 3) {
              _this.setData({ videoName: res.data, imgList: [] })
              app.common.hideLoading()
            }
            console.log(_this.data)
            
          }else{
            app.common.hideLoading()
            $Toast({ content: "请勿上传有敏感信息的图片，已为您删除" })
          }
        }
      },
    })
  },
  //删除所选择的图片 
  deleteImg(e){
    console.log(e)
    let newImgList = []
    let imgList = this.data.imgList
    let imgSrc = e.currentTarget.dataset.imgsrc
    for (let i = 0; i < imgList.length;i++ ){
      if (imgSrc != imgList[i]){
        newImgList.push(imgList[i])
      }
    }
    this.setData({ imgList: newImgList})
    console.log(this.data.imgList)
  },
  // 发布评论保存
  saveNews(e){
    let lock = this.data.lock
    let typeId = this.data.typeId
    let imgList = this.data.imgList
    let content = e.detail.value.context
    let city = app.cityInfo.realCity
    let value = content.replace(/(^\s*)|(\s*$)/g, "")  //去掉前后空格
    let showAddress = this.data.showAddress
    let address = this.data.address
    if (!showAddress) address = ''
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      forumCity: city,
      forumTypeId: typeId,
      title: '',
      context: value,
      mediaList: [],
      lon: this.data.longitude,
      lat: this.data.latitude,
      address: address,
    }

    //return false;
    // if (!value) {
    //   app.common.showToast("请输入帖子内容", "success")
    //   return false
    // }
    if (typeId == 0){
      app.common.showToast("请选择动态类型","success")
      return false
    }
    if (imgList.length>0){
      for(let i =0;i<imgList.length;i++){
        if(i<6)data.mediaList.push({ url: imgList[i], description: '', status: 1, statusActive: 1})
      }
    }
    //没有选择图片，也没有选择图片，设置默认图片
    if (imgList.length == 0 ){
      $Toast({ content: "请添加图片" })
      return false
    }
    console.log("发帖数据",data)
    //发布内容敏感词检测
    if(value){
      if (lock)return false
      this.data.lock = true
      app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
        .then(res => {
          console.log("文件检测结果", res)
          if (res.statusCode == 200) {
            this.data.lock = false
            if (res.data.code == 10037) {
              $Toast({ content: res.data.msg })
              return false
            }
            if (res.data.code == 1) {
              this.savePosted(data)
            }
          }
        })
    }else{
      this.savePosted(data)
    }
  },
  //帖子保存
  savePosted(data){
    this.data.lock = true
    app.wxApi.wxPost("api-tribune/fourm/addForum", data)
      .then(res => {
        this.data.lock = false
        console.log("发布帖子动态结果", res)
        if (res.statusCode == 200 && res.data.code == 1) {
          $Toast({ content: "发布成功" })
          this.setData({ imgList : []})
          //刷新发现页面数据
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];   //上一个页面---发现首页
          setTimeout(() => {
            prevPage.onPullDownRefresh(false)
            wx.navigateBack({
              delta: 1
            })
          }, 500)
        }else{
          $Toast({ content: res.data.msg })
        }
      })
  },
  //显示/隐藏发帖协议
  lookAgreement(e){
    let status = e.currentTarget.dataset.status
    if(status == 'open'){
      this.setData({ showAgreement: true })
    }
    if (status == 'close') {
      this.setData({ showAgreement: false })
    }
  },
  //查看协议
  agreementPage(){
    wx.navigateTo({
      url: '/pages/found/agreement/agreement',
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
  //隐藏地址
  closeAddress(){
    this.setData({ showAddress: false,address: "你在哪儿？" })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {

  },
})