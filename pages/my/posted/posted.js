// pages/my/posted/posted.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // pageNumber: 1,
    // loadMore: true,
    noteType: 1,
    noData: false,
    noteDataShow : true,
    videoDataShow: false,
    userInfo: '',
    noDataText: "您暂无发布帖子",
    noDataImg : "/images/public/mypost_icon_com_no@3x.png",
    playImg:"/images/public/found_icon_de_pl@3x.png",
    commentImg: "/images/my/mypost_icon_com@3x.png",
    collectImg: "/images/my/mypost_icon_read@3x.png",
    likeImg: "/images/my/mypost_icon_good_pla@3x.png",
    select: [
      { text: "发布的帖子", type: 1, checked: true },
      { text: "发布的视频", type: 2, checked: false },
    ],
    noteData : [
      // { date: "2018-01-01", content: "1.尤为喜欢那一类拥有独立人格的人。懂得照顾自己，在事情处理妥帖后能尽情享受生活。他们不常倾诉，因自己的苦难自己有能力消释", comment: 222, collect: 333, like: 444 },
      // { date: "2018-01-02", content: "2.尤为喜欢那一类拥有独立人格的人。懂得照顾自己，在事情处理妥帖后能尽情享受生活。他们不常倾诉，因自己的苦难自己有能力消释", comment: 222, collect: 333, like: 444 },
    ],
    videoData: [
      { faceImg: "", date: "2018-01-02", title: "20分钟瑜伽训练1", comment: 222, collect: 333, like: 444 },
      { faceImg: "", date: "2018-01-03", title: "20分钟瑜伽训练2", comment: 111, collect: 112, like: 113 }, 
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.common.navTitle("我的发帖")
    this.setData({userInfo:app.userMsg.userInfo})
    this.getMyPulish(this.data.noteType)
  },
  /**
   * 选择发帖的视频或帖子，加载对应数据
   */
  select: function(e) {
    let _this = this;
    let type = e.currentTarget.dataset.type;
    let data = this.data.select;
    if (this.data.noteType == type) return false
    for (let i = 0; i < data.length; i++) {
      if (type == data[i].type) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    //发布得视频
    if (type == 2){
      let noDataImg = "/images/public/vidio_icon_no@3x.png"
      _this.setData({ noteType: type, noteDataShow: false, videoDataShow: false, select: data, noData: true, noDataImg: noDataImg, noDataText:"您暂无发布视频"})
    } 
    //发布得帖子
    if (type == 1){
      let noDataImg = "/images/public/mypost_icon_com_no@3x.png"
      _this.setData({ noteType: type, noteDataShow: true, videoDataShow: false, select: data, noData: false, noDataImg: noDataImg, noDataText: "您暂无发布帖子"})
      _this.getMyPulish(type)
    }
    //调用接口获取数据
  },
  //获取我发布得帖子、视频
  getMyPulish(type){
    let fun = ''
    let data = {
      userNumber: app.userMsg.userNumber,  // 
      tokenNumber: app.userMsg.tokenNumber, // 
      UserNumberTo: app.userMsg.userNumber
    }
    if (type == 1) fun = "api-tribune/fourm/forumListOfUser"
    app.wxApi.wxPost(fun, data)
      .then(res => {
        console.log("获取我发布得帖子",res)
        if (res.statusCode == 200 ) {
          let data = res.data.data
          if (data == null || data.length == 0 ){
            this.setData({ noData: true })
          }
          if (data.length>0){
            for (let i = 0; i < data.length;i++){

              let url = ''
              if (data[i].mediaList[0].url) url = data[i].mediaList[0].url
              if (data[i].mediaList[0].firstImg) url = data[i].mediaList[0].firstImg
              if (url) url = app.common.judgeType(url)
              data[i].faceImg = url

              if (!data[i].nickName) data[i].nickName = this.data.userInfo.nickName
              if (!data[i].headImg) data[i].headImg = this.data.userInfo.headImg

              if (data[i].nickName && data[i].nickName.length > 5) data[i].nickName = data[i].nickName.substring(0, 5) + '...'
              if (data[i].context && data[i].context.length > 10) data[i].context = data[i].context.substring(0, 10) + '...'
              data[i].success = false
            }
            this.setData({ noteData: data })
          }
        }else{
          app.common.showToast(res.data.msg)
        }
      })
  },
  //跳转到发布得帖子页面
  toDetailPage(e) {
    let num = e.currentTarget.dataset.num;
    let unum = e.currentTarget.dataset.unum;
    //帖子
    wx.navigateTo({
      url: '/pages/dynamic/dynamicDetail/dynamicDetail?handleType=delete&forumNumber=' + num + "&uNumber=" + unum,
    })
  },
  //帖子封面图片加载完成
  loadSuccess(e) {
    let list = this.data.noteData
    let num = e.currentTarget.dataset.num
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (num == list[i].forumNumber) {
          list[i].success = true
          this.setData({ noteData: list })
          break;
        }
      }
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (status = true) {
    if(status)app.common.showToast("数据刷新中...")
    this.setData({
      noteData: [],
      pageNumber: 1,
      loadMore: true,
    })
    this.getMyPulish(this.data.noteType)
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    // let loadMore = this.data.loadMore
    // if (loadMore) {
    //   //触底加载更多数据
    //   this.fuzzySearch(this.data.searchId)
    // }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },
})