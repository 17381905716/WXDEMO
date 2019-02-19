
const app  = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noCourseList: false,
    loadMore: true,
    pageNummber: 1,
    courseTypeId: 0,
    cityId: 0,
    noDataImg1: app.img.noDataImg1,
    praiseImg: "/images/public/course_icon_good@3x.png",
    commentImg: '/images/public/course_icon_com @3x.png',
    playImg: '/images/public/course_icon_tv@3x.png',
    advertImg: [],  //广告图片
    searchType: [
      { courseTypeId: 0, courseTypeName: "推荐", checked: true },
    ],
    courseList:[
      // { courseId: '1', courseNumber: '123456', courseTitle: '减肥瘦腰1', courseSperm:1, coursePlay: 123, coursePraise: 222 },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.cityId = app.cityInfo.cityId
    this.getAdvert();
    this.getCourseType()
    this.getVideoData()
    //注册通知
    app.wxNotice.addNotification('noticeName', this.switchCityInform, this)
  },
  //点击广告图片
  advertEvent(e) {
    let urlType = e.currentTarget.dataset.type
    let url = e.currentTarget.dataset.url
    var reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    //let num = e.currentTarget.data.num
    if (urlType == 1) {
      if (reg.test(url)) {
        wx.showModal({
          title: '',
          content: '请下载“纯氧健身”app查看',
          showCancel: false
        })
      } else {
        app.common.showToast("网址错误")
      }
    }
    if (urlType == 2) {
      if (!url || reg.test(url)) {
        app.common.showToast("课程详情有误")
        return false
      }
      wx.navigateTo({
        url: "/pages/course/detail/detail?courseNumber=" + url,
      })
    }
  },
  /**
  * 搜索方法
  */
  search: function (e) {
    let _this = this;
    //获取选中的下标
    let id = e.currentTarget.dataset.id;
    let typeData = this.data.searchType
    if (this.data.courseTypeId == id) return false
    for (let i = 0; i < typeData.length; i++) {
      if (typeData[i].courseTypeId == id) {
        typeData[i].checked = true;
      } else {
        typeData[i].checked = false;
      }
    }
    _this.setData({ searchType: typeData, courseTypeId: id, loadMore: true, pageNumber: 1, courseList: []})  
    if (id > 0) this.courseTypeList(id) //获取分类类型数据
    if (id == 0) this.getVideoData() //获取推荐列表数据
  },
  /**
  * 跳转视频详情页
  */
  courseDetail:function(e){
    let courseNumber = e.currentTarget.dataset.number
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/course/detail/detail?courseNumber=' + courseNumber+"&courseId="+id,
    })
  },
  /**
  * 跳转视频搜索页面
  */
  searchVideo:function(){
    wx.navigateTo({
      url: '/pages/course/searchVideo/searchVideo',
    })
  },
  /**
   * 跳转到扫码页面
   */
  toScanPage: function () {
    wx.navigateTo({
      url: '/pages/scan/scan',
    })
  },
  /**
  * 获取课程分类类型
  */
  getCourseType:function(){
    let _this = this;
    let data = {
      pageNum: 1,
      pageSize: 10,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-teaching-video/coursetype/getCourseTypeList", data)
    .then( res => {
      if (res.statusCode == 200 && res.data.data.length > 0){
        let data = _this.data.searchType;
        for(let i = 0;i < res.data.data.length;i++){
          res.data.data[i].checked = false;
          data.push(res.data.data[i])
        }
        _this.setData({ searchType : data})
      }
    })
  },
  //获取广告图片
  getAdvert(){
    let _this = this
    let data = {
      advertAddress: 2,
	    advertCity: this.data.cityId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-user/advert/getAdvertList",data)
    .then( res => {
      if(res.statusCode == 200 && res.data.data.length > 0){
        _this.setData({ advertImg : res.data.data})
      }
    })
  },
  //获取课程数据
  getVideoData(){
    let _this = this;
    let data = {
      pageNum:this.data.pageNumber,
      pageSize:10,
      tokenNumber:app.userMsg.tokenNumber,
      userNumber:app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-teaching-video/courselist/getIndexData",data)
    .then( res => {
      console.log()
      if (res.statusCode == 200 && res.data.code == 1) {
        let oldData = this.data.courseList;
        let list = res.data.data
        let noData = false
        if (list == null || list.length == 0) noData = true
        if (list.length < 10) this.data.loadMore =  false 
        if (list.length == 10) this.data.pageNumber ++
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            let url = ''
            if (list[i].courseImg) url = list[i].courseImg
            if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
            list[i].faceImg = url 
            if (!list[i].faceImg) list[i].faceImg = app.img.noDataImg1
            oldData.push(list[i])
          }
        }
        this.setData({ courseList: oldData, noCourseList: noData })
      } else {
        
        app.common.showToast("网络错误")
      }

      // if(res.statusCode == 200 && res.data.data.length > 0){
      //   _this.setData({courseList : res.data.data})
      // }
    })
  },
  //获取分类类型数据  
  courseTypeList(typeId){
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      typeId: typeId,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-teaching-video/courselist/getTypeData", data)
      .then(res => {
        console.log("获取课程列表",res)
        if (res.statusCode == 200 && res.data.code == 1) {
          //debugger
          let oldData = this.data.courseList;
          let list = res.data.data
          let noData = false
          if (list == null || list.length == 0) noData = true
          if (list.length < 10) this.data.loadMore = false 
          if (list.length == 10) this.data.pageNumber++
          if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              let url = ''
              if (list[i].courseImg) url = list[i].courseImg
              if (url) url = app.common.judgeType(url)  //判断是图片、还是视频 
              list[i].faceImg = url 
              if (!list[i].faceImg) list[i].faceImg = app.img.noDataImg1
              list[i].success = false
              oldData.push(list[i])
            }
          }
          //oldData[0].noDataImg1 = app.img.noDataImg1
          this.setData({ courseList: oldData, noCourseList: noData })
        } else {
          app.common.showToast(res.data.msg)
        }
      })
  },
  //图片加载完成
  loadResult(e) {
    let list = this.data.courseList
    let id = e.currentTarget.dataset.id
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (id == list[i].courseId) {
          list[i].success = true
          this.setData({ courseList: list })
          break;
        }
      }
    }
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中···")
    let typeId = this.data.courseTypeId
    this.setData({
      courseList: [],
      advertImg: [],
      pageNumber: 1,
      loadMore: true,
    })
    this.getAdvert();
    //this.getCourseType()
    if (typeId == 0)this.getVideoData()
    if (typeId > 0) this.courseTypeList(typeId)
    setTimeout(() => {
      wx.stopPullDownRefresh()
      //app.common.hideLoading()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let typeId = this.data.courseTypeId
    let loadMore = this.data.loadMore
    if (loadMore) {
      //触底加载更多数据
      if(typeId == 0)this.getVideoData()
      if (typeId > 0)this.courseTypeList(typeId)
    }
  },
  //切换城市通知，更新数据
  switchCityInform(data) {
    //app.cityInfo = data
    this.setData({
      cityId: data.cityId,
      advertImg: [],
    })
    this.getAdvert();
  },
  onUnload: function () {
    //移除通知
    var that = this
    app.wxNotice.removeNotification('noticeName', that)
  },
  //点击tabBar
  onTabItemTap(item) {
    let nowPage = app.globalData.nowPage
    if (nowPage === 'course') {
      //回到顶部
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      app.globalData.nowPage = 'course'
      return false
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "说出你的故事-一起分享心得",
      imageUrl: app.img.shareImage,
      path: '/pages/index/userLogin/userLogin?type=test',
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
})