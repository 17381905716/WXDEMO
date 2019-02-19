// pages/my/collect/collect.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */ 
  data: {
    noData : false,
    collectType: 1,
    pageNumber: 1,
    loadMore: true,
    lock: false,
    playBtn: app.img.playBtn,
    noDataImg: app.img.noDataImg1,
    starImg: app.img.starImg,
    noStarImg: app.img.noStarImg,
    openImg: "/images/index/home_icon_open@2x.png",
    closeImg: "/images/index/home_icon_clo@2x.png",
    array: [0, 1, 2, 3,4],
    select: [
      { text: "收藏的帖子", type: 1, checked: true },
      { text: "收藏的视频", type: 2, checked: false },
      { text: "收藏的店铺", type: 4, checked: false },
    ],
    // postShow: true,
    // videoShow: false,
    // shopShow: false,
    collectData: [], //收藏的帖子
    collectVideo: [], //收藏的视频
    collectFitness: [],  //收藏的店铺
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("我的收藏");
  },
  /**
   * 选择视频或帖子，加载对应数据
   */
  select:function(e){
    let _this = this;
    //let showType = false;
    let type = e.currentTarget.dataset.type;
    let data = this.data.select;
    for(let i = 0; i <data.length;i++){
      if(type == data[i].type){
        data[i].checked = true;
      }else{
        data[i].checked = false;
      }
    }
    if (this.data.collectType == type) return false
    _this.setData({ select: data, collectType: type, noData: false, collectData: [],collectVideo: [],collectFitness:[],pageNumber: 1, loadMore: true});
    //调用接口获取数据
    if (type == 4){
      _this.getFitnessList(type)
    }else{
      _this.getDataList(type)
    }
  },
  /**
   * 获取帖子或视频，收藏数据
   */
  getDataList(collectType) {
    let data = {
      userNumber: app.userMsg.userNumber,  // 478953597552431104,
      tokenNumber: app.userMsg.tokenNumber, // "6d002e4aea9b41deb43e0e140e8dabb3",
      pageNumber: this.data.pageNumber,
      
      collectType: collectType,
    }
    console.log(data)  //api-user/user/getCollections
    //debugger;
    app.wxApi.wxPost("api-user/user/getCollections", data)
    .then(res => {
      console.log("获取收藏数据",res)
      
      if(res.statusCode == 200 && res.data.code == 1){    
        let list = res.data.data   
        if (list == null || list.length == 0) {
          this.setData({ noData: true, loadMore: false })
          return false
        }
        //return 
        if (list.length > 0){
          if (list.length < 10) this.setData({ loadMore: false })
          if (list.length == 10)this.data.pageNumber ++ 
          let array = this.data.collectData
          let collectData = res.data.data
          for (let i = 0; i < collectData.length; i++) {

            let url = ''
            if (collectData[i].img) url = collectData[i].img
            if (collectData[i].status == 2) url = collectData[i].firstImg
            if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
            collectData[i].img = url 

            if (collectData[i].content.length > 25) {
              collectData[i].content = collectData[i].content.substring(0, 25) + "..."
            }
            collectData[i].success = false
            array.push(collectData[i])
          }
          if (collectType == 1 )this.setData({ collectData: array,collectVideo:[], collectFitness:[] })
          if (collectType == 2) this.setData({ collectData: [], collectVideo: array, collectFitness: [] })
          console.log(this.data)
        }
      }
    })
  },
  //获取收藏店铺
  getFitnessList(collectType){
    let data = {
      userNumber: app.userMsg.userNumber,  // 478953597552431104,
      tokenNumber: app.userMsg.tokenNumber, // "6d002e4aea9b41deb43e0e140e8dabb3",
      pageNumber: this.data.pageNumber,
      collectType: collectType, // 4
      longitude: app.cityInfo.longitude,
      latitude: app.cityInfo.latitude,
    }
    app.wxApi.wxPost("api-user/user/getCollections", data)
      .then(res => {
        console.log("获取收藏数据", res)
        let list = res.data.data
        if (list == null || list.length == 0) {
          this.setData({ noData: true, loadMore: false })
          return false
        }
        if (list.length > 0) {
          if (list.length < 10) this.setData({ loadMore: false })
          if (list.length == 10) this.data.pageNumber++
          let array = this.data.collectFitness
          let collectData = res.data.data
          for (let i = 0; i < collectData.length; i++) {
            collectData[i].success = false
            if (!collectData[i].level) collectData[i].level = 0
            collectData[i].level = Math.round(collectData[i].level)
            array.push(collectData[i])
          }
          this.setData({collectData: [],collectVideo:[], collectFitness : array, count: res.data.count})
        }
      })  
  },
  //跳转到发帖子或视频详情页面
  detailPage(e) {
    let num = e.currentTarget.dataset.num
    let type = e.currentTarget.dataset.type  //1是帖子，3是视频
    let uNum = e.currentTarget.dataset.unum
    console.log(type,num,uNum)
    console.log(type ==1)
    //帖子
    if(type ==1){
      wx.navigateTo({
        url: '/pages/found/detail/detail?forumNumber=' + num + "&uNumber=" + uNum  ,
      })
    }
    //课程
    if(type ==2){
      wx.navigateTo({
        url: '/pages/course/detail/detail?courseNumber=' + num,
      })
    }
    //视频
    if (type == 3) {
      wx.navigateTo({
        url: '/pages/course/playDetail/playDetail?classNumber=' + num + "&userNumber=" + uNum
      })
    }
    //店铺
  },
  //图片加载完成
  loadSuccess(e) {
    let list = []
    let collectType = this.data.collectType
    if (collectType == 1) list = this.data.collectData
    if (collectType == 2) list = this.data.collectVideo
    let num = e.currentTarget.dataset.num
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (num == list[i].passiveCollect) {
          list[i].success = true
          if (collectType == 1) this.setData({ collectData: list })
          if (collectType == 2) this.setData({ collectVideo: list })
          break;
        }
      }
    }
  },
  // 跳转到店铺详情
  toDetail: function (e) {
    let fitnessNumber = e.currentTarget.dataset.number;
    let indexImg = e.currentTarget.dataset.indeximg;
    wx.navigateTo({
      url: '/pages/index/detail/detail?fitnessNumber=' + fitnessNumber + "&indexImg=" + indexImg,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    let collectType = this.data.collectType
    this.setData({
      collectFitness: [],
      collectVideo: [],
      collectData: [],
      pageNumber: 1,
      loadMore: true,
    })
    if (collectType == 1 || collectType == 2)this.getDataList(collectType)
    if (collectType == 4) this.getFitnessList(collectType)
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let loadMore = this.data.loadMore
    let collectType = this.data.collectType
    if (loadMore) {
      //触底加载更多数据
      if (collectType == 1 || collectType == 2)this.getDataList(collectType)
      if (collectType == 4) this.getFitnessList(collectType)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let collectType = this.data.collectType
    this.setData({ collectData: [], collectVideo: [], collectFitness: [], pageNumber: 1, loadMore: true })
    if (collectType == 1 || collectType == 2 )this.getDataList(collectType)
    if (collectType == 4) this.getFitnessList(collectType)
  },
})