// pages/course/detail/detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseNumber: '',
    userNumber: '',
    shareTitle: '',
    shareImg: '',
    courseDetail: [],
    noHeadImg: app.img.noHeadImg,
    halfStar: app.img.halfStar,
    fullStar: app.img.fullStar,
    playImg: app.img.playImg,
    playBtn: app.img.playBtn,
    halfLike: app.img.halfLike,
    fullLike: app.img.fullLike,
    memberImg: app.img.memberImg,

    comment: "/images/public/course_icon_com@3x.png",
    likeNumImg:'/images/public/found_icon_like@3x.png',
    videoData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ courseNumber: options.courseNumber})
    app.common.navTitle("课程详情");
    //增加课程浏览数量
    this.addCourseScan(options.courseNumber)
  },
  //增加课程浏览数量
  addCourseScan(courseNumber) {
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      courseNumber: courseNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courselist/coursePlay", data)
      .then(res => {
        console.log("增加课程浏览量",res)
      })
  },
  /**
   * 跳转播放详情页面
   */
  toPlayDetail:function(e){
    let num = e.currentTarget.dataset.num
    // let index = e.currentTarget.dataset.index
    // let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/course/playDetail/playDetail?classNumber=' + num + "&userNumber=" + this.data.userNumber
    })
  },
  //获取视频列表
  getVideoList(){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      courseNumber: this.data.courseNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courseclass/getClassList",data)
    .then( res => {
      console.log("获取视频列表",res)
      let data  = res.data.data
      for(let i = 0; i < data.length; i++){

        let url = ''
        if (data[i].classHeadUrl) url = data[i].classHeadUrl
        if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
        if (!url) url = app.img.noDataImg1
        data[i].classHeadUrl = url
        if (data[i].classDescription.length > 25) data[i].classDescription = data[i].classDescription.substring(0,25) + "..."
      }
      this.setData({ videoData: data })
    })
  },
  //获取课程详情
  getCourseDetail(){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      courseNumber: this.data.courseNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courselist/getCourseInfo",data)
    .then( res => {
      console.log("获取课程详情",res)
      if(res.statusCode == 200){

        let imgSrc = ''
        let headImg = res.data.data[0].headImg
        if (headImg) imgSrc = app.common.judgeType(headImg) // 判断是否是合法的图片，视频地址
        if (!imgSrc) imgSrc = app.img.noHeadImg
        res.data.data[0].headImg = imgSrc

        this.setData({
          userNumber: res.data.data[0].userNumber,
          courseDetail: res.data.data[0],
          shareImg: res.data.data[0].courseImg,
          shareTitle: '【课程-视频】' + res.data.data[0].courseTitle + '-' + res.data.data[0].courseDescription
        })
      }
      
    })
  },

  //关注发布人
  about(e){
    let userNumber = e.currentTarget.dataset.usernumber;
    let about = e.currentTarget.dataset.about;
    let data = {
      launchUser:app.userMsg.userNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      acceptUser: userNumber,
    }
    app.common.aboutOther(app, data, about, "courseDetail", this);
  },
  //视频点赞 classId
  likeVideo(e){
    let _this = this
    let id  = e.currentTarget.dataset.id;
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      classId: id,
    }
    console.log(data)
    app.wxApi.wxPost("api-teaching-video/courseclass/classParise",data)
    .then( res => {
      console.log("视频点赞",res)
      if(res.statusCode == 200 && res.data.code ==1){
        app.common.showToast("点赞成功")
        //点赞成功，刷新数据
        _this.getVideoList()
      }
      
    })
    
  },
  //收藏课程
  collectCourse(e){
    let _this = this
    let num = e.currentTarget.dataset.num
    let collect = e.currentTarget.dataset.collect //为1已收藏，为0未收藏
    let data = {
      collectUserNumber: this.data.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      passiveCollect: num, //视频、帖子、课程编号
      collectType: 2,
    }
    console.log(data)
    app.common.collect(app, data, collect, this);
    return false
    //收藏课程
    if (collect == 0){
      app.wxApi.wxPost("api-user/user/collections", data)
        .then(res => {
          console.log("收藏课程", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            app.common.showToast(res.data.msg,"success")
            //收藏成功，刷新数据
            _this.getCourseDetail()
          }
        })
    } else {  //取消收藏  
      app.wxApi.wxPost("api-user/user/cancelCollections", data)
        .then(res => {
          console.log("收藏课程", res)
          if (res.statusCode == 200 && res.data.code == 1) {
            app.common.showToast(res.data.msg,"success")
            //关注成功，刷新数据
            _this.getCourseDetail()
          }
        })
    }
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app, e) // 查看其他人
  },

  /**
   * 转发方法
   */
  onShareAppMessage: function (res) {
    return {
      title: this.data.shareTitle,
      path: '/pages/index/userLogin/userLogin',
      imageUrl: this.data.shareImg,
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showLoading("数据刷新中···")
    this.getVideoList()
    this.getCourseDetail()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      app.common.hideLoading()
    }, 1500)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getVideoList()
    this.getCourseDetail()
  },

})