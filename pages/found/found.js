const { $Toast } = require('../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadMore: true,
    playBtn: app.img.playBtn,
    noteType: 0,
    noData: false,
    pageNumber: 1,
    count: 0,
    typeId: 0,
    current_tab: 0,
    sType: [],
    newsData: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取帖子类型
    this.getNewsType()
  },
  /**
   * 跳转到详情页
   */
  toDetailPage: function(e){
    //let id = e.currentTarget.dataset.id;
    let num = e.currentTarget.dataset.num;
    let unum = e.currentTarget.dataset.unum;
    wx.navigateTo({
      url: '/pages/found/detail/detail?forumNumber=' + num + "&uNumber="+unum,
    })
  },
  /**
  * 搜索方法
  */
  choose(e) {
    let _this = this;
    let data = this.data.sType
    //获取选中的下标
    let index = e.currentTarget.dataset.index;
    let typeId = data[index].typeId;
    let type = data[index].type;
    if (this.data.typeId == typeId)return false
    for (let i = 0; i < this.data.sType.length; i++) {
      if (i == index) {
        this.data.sType[i].checked = true;
      } else {
        this.data.sType[i].checked = false;
      }
    } 
    //数据更新  , current_tab:index
    _this.setData({ sType: this.data.sType, typeId: typeId, pageNumber: 1, newsData: [], loadMore: true, noData: false });
    if(type == 'about'){ 
      _this.data.loadMore = false 
      //获取关注帖子
      _this.getAboutNews()
      _this.data.noteType = 'about'
    }else{
      //获取对应类型数据
      this.getTypeList(typeId)
      _this.data.noteType = typeId
    }
  },
  //跳转到发新贴页面
  toaddNews:function(){
    let result = app.common.checkProhibit(app,this)
    if (result){
      wx.navigateTo({
        url: '/pages/found/addNews/addNews?noteType=' + this.data.noteType,
      })
    }
  },
  //查询帖子类型  
  getNewsType(){
    let _this = this
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-tribune/forumtype/getTypeList", data)
      .then(res => {
        console.log("查询帖子类型",res)
        if (res.statusCode == 200 && res.data.data.length > 0) {
          let data = _this.data.sType
          for(let i = 0; i < res.data.data.length;i++){
            data.push({ 
              typeId: res.data.data[i].typeId,
              name: res.data.data[i].name,
              type: '',
              checked: false,
            })
          }
          // 增加关注类型
          data.push({
            typeId: 0,
            name: "关注",
            type: 'about',
            checked: false,
          })
          data[0].checked = true
          _this.setData({ sType: data, typeId: data[0].typeId })
          _this.getTypeList(data[0].typeId)
        }
      })
  },
  //查询热门帖子（该方法暂时弃用）
  getHotNews(){
    let data = {
      pageNum: this.data.pageNumber,
      pageSize: 10,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    app.wxApi.wxPost("api-tribune/fourm/getForumIndex", data)
      .then(res => {
        console.log("查询热门帖子",res)
        if (res.statusCode == 200) {
          let note = res.data.data
          if (note == null || note.length ==0){
            this.setData({ noData: true })
            return false
          }
          let oldData = this.data.newsData;
          let list = res.data.data.dataList
          if (list == null || list.length == 0) this.setData({ noData: true })
          if (list.length < 10) this.data.loadMore = false 
          if (list.length == 10) this.data.pageNumber++
          if (list.length > 0) {
            for (let i = 0; i < list.length;i++){
              
              let url = ''
              if (list[i].mediaList[0].url) url = list[i].mediaList[0].url
              if (list[i].mediaList[0].firstImg) url = list[i].mediaList[0].firstImg
              if (url) url = app.common.judgeType(url)  //判断是图片、还是视频
              if (url) url += "@w_640,h_320,q_70"
              list[i].faceImg = url

              if (list[i].nickName && list[i].nickName.length > 5) list[i].nickName = list[i].nickName.substring(0,5) + '...'
              if (list[i].context.length > 10) list[i].context = list[i].context.substring(0, 10) + '...'
              if (list[i].headImg == null || list[i].headImg == '') list[i].headImg = app.img.noHeadImg
              list[i].success = false
              oldData.push(list[i])
            }
            this.setData({ newsData: oldData, count: res.data.data.count })
          }
        }else{
          app.common.showToast("网络错误")
        }
      })
  },
  //查询我关注的帖子
  getAboutNews() {
    let data = {
      launch_user: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/getFollowList", data)
      .then(res => {
  
        console.log("查询我关注的帖子",res)
        if (res.statusCode == 200 ) {
          let newsData = res.data.data
          if (res.data.data == null || res.data.data.length == 0) this.setData({ noData: true })
          if (newsData.length>0){
            for(let i = 0;i<newsData.length;i++){
              let url = ''

              if (newsData[i].mediaList[0].url) url = newsData[i].mediaList[0].url
              if (newsData[i].mediaList[0].firstImg) url = newsData[i].mediaList[0].firstImg
              if (url) url = app.common.judgeType(url)
              if (url) url += "@w_640,h_320,q_70"
              newsData[i].faceImg = url
              newsData[i].success = false

              if (newsData[i].nickName && newsData[i].nickName.length > 5) newsData[i].nickName = newsData[i].nickName.substring(0, 5) + '...'
              if (newsData[i].context && newsData[i].context.length > 10) newsData[i].context = newsData[i].context.substring(0,10)+'...'
              if (newsData[i].headImg == null || newsData[i].headImg == '') newsData[i].headImg = app.img.noHeadImg
            }
            this.setData({ newsData: newsData })
          }
        }
      })
  },
  //查询类型列表，帖子数据  
  getTypeList(typeId){
    let city = app.cityInfo.realCity
    let data = {
      typeId: typeId,
      pageNum: this.data.pageNumber,
      pageSize: 10,
      forumCity: city,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber
    }
    console.log("查询类型列表，帖子数据-----参数", data)
    app.wxApi.wxPost("api-tribune/fourm/getTypeOfList", data)
      .then(res => {
        console.log("查询类型列表，帖子数据",res)
        if (res.statusCode == 200) {
          let oldData = this.data.newsData;
          let data = res.data.data
          if (data == null ) this.setData({ noData: true })
          if (data){
            let list = res.data.data.dataList
            if (list == null || list.length == 0 ){
              this.setData({ noData: true })
              return false
            }
            if (list.length < 10) this.data.loadMore =  false 
            if (list.length == 10) this.data.pageNumber++
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                let url = ''
                
                if (list[i].mediaList[0].url) url = list[i].mediaList[0].url
                if (list[i].mediaList[0].firstImg) url = list[i].mediaList[0].firstImg
                if (url) url = app.common.judgeType(url)
                if (app.common.judgeNetImage(url)) url += "@w_640,h_320,q_70"  //验证是网络图片，拼接显示小图
                list[i].faceImg = url
                if (list[i].nickName && list[i].nickName.length > 5) list[i].nickName = list[i].nickName.substr(0, 5) + '...'
                if (list[i].context.length > 10) list[i].context = list[i].context.substring(0, 10) + '...'
                if (list[i].headImg == null || list[i].headImg == '') list[i].headImg = app.img.noHeadImg
                list[i].success = false
                oldData.push(list[i])
              }
              this.setData({ newsData: oldData, count: res.data.data.count })
            }
          }
        } else {
          app.common.showToast("网络错误")
        }
      })
  },
  //刷新发现数据列表  flushFollowList
  refreshFoundList(){
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      launch_user: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/fourm/flushFollowList", data)
      .then(res => {
        console.log("刷新关注缓存", res)
      })
    app.wxApi.wxPost("api-tribune/forumtype/flushTypeList", data)
      .then(res => {
        console.log("刷新发现缓存结果", res)
      })
  },
  //图片加载完成
  loadSuccess(e) {
    let list = this.data.newsData
    let num = e.currentTarget.dataset.num
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (num == list[i].forumNumber) {
          list[i].success = true
        }
      }
      this.setData({ newsData: list })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (status = true) {
    if (status)app.common.showToast("数据刷新中...")
    let noteType = this.data.noteType
    let typeId = this.data.typeId
    this.setData({ 
      //sType: sType ,
      loadMore: true,
      pageNumber: 1,
      newsData: []
    })
    this.refreshFoundList()
    if (noteType == 'about') {
      this.getAboutNews()
    }else{
      if (typeId) this.getTypeList(typeId)
    }
    
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.newsData.length
    let loadMore = this.data.loadMore
    let noteType = this.data.noteType
    if (loadMore && (count > length)) {
      //触底加载更多数据
      if (this.data.typeId > 0) this.getTypeList(this.data.typeId)
    }
  },
  //点击tabBar
  onTabItemTap(item) {
    let nowPage = app.globalData.nowPage
    if (nowPage === 'found') {
      //回到顶部
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      app.globalData.nowPage = 'found'
      return false
    }
  },
  //页面滑动
  onPageScroll(res){
  },
})