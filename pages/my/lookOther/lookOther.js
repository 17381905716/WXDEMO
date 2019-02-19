const { $Toast } = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //selectType:1,
    noteShow: true, 
    videoShow:false,
    fansShow: false,
    noteData: [],
    videoData: [],
    fansData: [],
    isFollow: 0,
    bgImg: app.img.myInfoBg,
    noHeadImg: app.img.noHeadImg,
    memberImg: app.img.memberImg,
    vipImg1: "/images/my/my_icon_vip_no@3x.png",
    vipImg2: "/images/my/other_icon_vip@3x.png",

    womanImg: "/images/dynamic/woman_one@2x.png",
    manImg: "/images/dynamic/man_one@2x.png",
    select: [
      { text: "发帖", type: 1, num: 0, checked: true },
      { text: "发布课程", type: 2, num: 0, checked: false },
      { text: "粉丝", type: 3, num: 0, checked: false },
    ],
    otherInfo: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var now = new Date("2019-01-01").getTime(); 
    // var date1 = new Date().getTime()
    // var s = (date1 -now )/(1000 * 60 * 60 * 24)
    // console.log(now, date1,s)
    //this.data.otherNumber = options.otherNumber
    this.setData({ userNumber: app.userMsg.userNumber, otherNumber: options.otherNumber})
    this.getOtherInfo()
  },

  /**
 * 选择视频或帖子，加载对应数据
 */
  select: function (e) {
    let _this = this;
    //let notData = false;
    let type = e.currentTarget.dataset.type;
    let data = this.data.select;
    for (let i = 0; i < data.length; i++) {
      if (type == data[i].type) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    if (type == 1) this.setData({ noteShow: true, videoShow: false, fansShow: false })
    if (type == 2) this.setData({ noteShow: false, videoShow: true, fansShow: false })
    if (type == 3) this.setData({ noteShow: false, videoShow: false, fansShow: true })
    _this.setData({ select: data, selectType: type});
    //调用接口获取数据
    //_this.getDataList(type)
  },
  //获取被查看人的资料
  getOtherInfo(){
    let _this = this
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "otherUserNumber": this.data.otherNumber //
    }
    app.wxApi.wxPost("api-user/user/getOtherMsg", data)
      .then(res => {
        console.log("获取他人资料",res)
        //_this.setData({ otherInfo: res.data.data })
        if(res.statusCode == 200 && res.data.code==1){
          let data = res.data.data
          if (data.phoneNumber)data.phoneNumber = data.phoneNumber.substring(0, 3) + "****" + data.phoneNumber.substring(data.phoneNumber.length - 4)
          if (data.birthday)data.birthday = data.birthday.substring(0, 10) 
          
          //let imgSrc = ''
          //let headImg = data.headImg
          //if (headImg) imgSrc = app.common.judgeType(headImg)
          if (!data.headImg) data.headImg = app.img.noHeadImg
          //data.headImg = headImg
          _this.setData({otherInfo:data})
          _this.getNoteData()

        }else{
          $Toast({ content: res.data.msg })
        }
      })
  },
  //查询是否关注查看的人
  getFollowResult(){
    let data = {
      launchUser: app.userMsg.userNumber,
      acceptUser: this.data.otherNumber,
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
    }
    app.wxApi.wxPost("api-tribune/findfollow/queryIsFollow", data)
      .then(res => {
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data == 1) {
            this.setData({isFollow:res.data})
          }else{
            this.setData({ isFollow: 0 })
          }
        }
      })
  },
  //进行关注、取消关注
  //关注发布人
  about(e) {
    ///let userNumber = this.data.uNumber;
    let about = e.currentTarget.dataset.about;
    let data = {
      launchUser: app.userMsg.userNumber,
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      acceptUser: this.data.otherNumber,
    }
    app.common.aboutOther(app, data, about, "lookOther", this);
  },

  //获取发布得帖子   
  getNoteData() {
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      UserNumberTo: this.data.otherNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/forumListOfUser", data)
      .then(res => {
        console.log("其他人帖子列表", res)
        if (res.statusCode == 200) {
          if (res.data.data.length > 0) {
            let list = res.data.data
            for (let i = 0; i < list.length;i++){
              let url = ''
              let otherInfo = this.data.otherInfo
              if (list[i].mediaList[0].url) url = list[i].mediaList[0].url
              if (list[i].mediaList[0].firstImg) url = list[i].mediaList[0].firstImg
              if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
              list[i].faceImg = url 
              if (otherInfo){
                list[i].nickName = otherInfo.nickName
                list[i].headImg = otherInfo.headImg
              }
              if (!list[i].headImg) list[i].headImg = app.img.noHeadImg
              if (list[i].nickName && list[i].nickName.length > 5) list[i].nickName = list[i].nickName.substring(0, 5) + '...'
              if (list[i].context && list[i].context.length > 10) list[i].context = list[i].context.substring(0,10) + '...'
              list[i].success = false
            }
            this.data.select[0].num = res.data.data.length
            this.setData({ noteData: list, select: this.data.select })
          }
        }
        console.log(this.data)
      })
  },
  //获取发布得视频
  getVideoList(){
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      otherVideoUserNumber: this.data.otherNumber,
    }
    app.wxApi.wxPost("api-teaching-video/courselist/selectListByUserNumbers",data)
    .then( res => {
      console.log("获取发布得视频",res)
      if(res.statusCode ==200){
        if(res.data.code ==1){
          let list = res.data.data
          if(list.length>0){
            for(let i=0;i<list.length;i++){
              if (list[i].course_img == '' || list[i].course_img == null) list[i].course_img = app.img.noDataImg1
              list[i].faceImg = list[i].course_img
              list[i].courseId = list[i].course_id
              list[i].courseNumber = list[i].course_number
              list[i].courseTitle = list[i].course_title
              list[i].coursePlay = list[i].course_play
              list[i].coursePraise = list[i].course_praise
              list[i].courseClassPlay = list[i].course_class_play
              list[i].courseSperm = list[i].course_sperm
              list[i].success = false
            }
            this.data.select[1].num = list.length
            this.setData({ videoData: list, select: this.data.select})
            console.log(this.data)
          }

        }else{
          app.common.showToast(res.data.msg)
        }
      }
      
    })
  },
  /**
   * 跳转视频详情页
   */
  courseDetail: function (e) {
    let courseNumber = e.currentTarget.dataset.number
    let id = e.currentTarget.dataset.id
    //增加课程浏览数量
    //this.addCourseScan(id)
    wx.navigateTo({
      url: '/pages/course/detail/detail?courseNumber=' + courseNumber + "&courseId=" + id,
    })
  },
  //跳转到视频详情页
  videoDetailPage(e) {
    console.log(e)
    let courseNumber = e.currentTarget.dataset.coursenumber
    let classId = e.currentTarget.dataset.classid
    let classNumber = e.currentTarget.dataset.classnumber
    let classIndex = e.currentTarget.dataset.classindex
    wx.navigateTo({
      url: '/pages/course/playDetail/playDetail?courseNumber=' + courseNumber + "&classId=" + classId + "&classNumber=" + classNumber + "&classIndex=" + classIndex
    })
  },
  //获取对应的粉丝    
  getFansData(){
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      othersUserNumber: this.data.otherNumber,
    }
    app.wxApi.wxPost("api-user/other/getFansList", data)
    .then( res => {
      console.log("粉丝列表",res)
      if(res.statusCode == 200){
        if(res.data.data.length>0){
          this.data.select[2].num = res.data.data.length
          this.setData({ fansData: res.data.data, select: this.data.select})
        }
      }
    })
  },
  //查看其他人的粉丝
  lookOtherFans(e){
    let selectData = this.data.select
    this.data.otherNumber = e.currentTarget.dataset.num
    for(let i=0;i<selectData.length;i++){
      selectData[i].num = 0
      selectData[i].checked = false
    }
    selectData[0].checked = true
    this.setData({
      noteShow: true,
      videoShow: false,
      fansShow: false,
      noteData: [],
      videoData: [],
      fansData: [],
      select: selectData
    })
    this.getOtherInfo()
    this.onShow()

  },
  /**
   * 跳转到帖子详情页
   */
  toDetailPage: function (e) {
    let id = e.currentTarget.dataset.id;
    let num = e.currentTarget.dataset.num;
    let unum = e.currentTarget.dataset.unum;
    wx.navigateTo({
      url: "/pages/dynamic/dynamicDetail/dynamicDetail?forumNumber=" + num + "&uNumber=" + unum,
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
  //课程封面图片加载完成
  loadResult(e) {
    let list = this.data.videoData
    let id = e.currentTarget.dataset.id
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (id == list[i].courseId) {
          list[i].success = true
          this.setData({ videoData: list })
          break;
        }
      }
    }
  },
  //查看用户头像大图
  lookUserPhoto() {
    let userPhoto = this.data.otherInfo.headImg
    if (!userPhoto) return false
    wx.previewImage({
      urls: [userPhoto],
      success: function (res) {
        console.log(res)
      },
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getVideoList()
    this.getFansData()
    this.getFollowResult()
  },
})