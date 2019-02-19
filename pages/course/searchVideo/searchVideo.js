// pages/course/searchVideo/searchVideo.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadMore:true,
    noData: true,
    pageNumber: 1,
    videoData: [],
    playBtn: app.img.playBtn,
    noDataImg1: app.img.noDataImg1,
    playImg: '/images/public/course_icon_tv@3x.png',
    likeImg: '/images/public/found_icon_like@3x.png',
    praiseImg: "/images/public/course_icon_good@3x.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 搜索视频方法
   */
  searchVideo:function(e){
    let value = e.detail.value;
    this.setData({ videoData: [], pageNumber: 1, loadMore: true, noData: true })
    if(value)this.getVideo(value)
  },

  //获取视频
  getVideo(value){
    let _this = this
    let data = {
      text: value,
      pageNum: this.data.pageNumber,
      pageSize: 10,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courseclass/queryCLassList", data)
      .then(res => {
        console.log("搜索结果", res)
        console.log(res.data.data)
        if (res.statusCode == 200) {
          if (res.data.code == 1){
            let array = this.data.videoData
            let noData = false
            let list = res.data.data.dataList
            if (res.data.data == null || list.length == 0) noData = true
            if(list.length>0){
              if (list.length < 10) this.setData({ loadMore: false })
              if (list.length == 10)this.data.pageNumber ++
              for(let i=0;i<list.length;i++){
                let url = list[i].classHeadUrl
                if (url) url = app.common.judgeType(url) 
                list[i].faceImg = url
                array.push(list[i])
              }
              _this.setData({ videoData: array, noData: noData })
            }
          }
        }
        console.log(this.data)
      })
  },
  //跳转到视频详情页
  videoDetailPage(e){
    console.log(e)
    // let courseNumber = e.currentTarget.dataset.coursenumber
    // let classId = e.currentTarget.dataset.classid
    // let classIndex = e.currentTarget.dataset.classindex

    let classNumber = e.currentTarget.dataset.classnumber
    wx.navigateTo({
      url: '/pages/course/playDetail/playDetail?classNumber=' + classNumber 
    })
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let loadMore = this.data.loadMore
    if (loadMore) {
      this.getVideo()
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //this.getVideo()
  },
})