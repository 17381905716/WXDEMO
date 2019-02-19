const {$Toast} = require('../../../dist/base/index.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    inputValue: '',
    commentId: 0,
    count: 0,
    pageNumber: 1,
    loadMore: true,
    lock: false,
    disable: false,
    answerList: [],
    note: {},
    noHeadImg: app.img.noHeadImg,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.common.navTitle("帖子回复")
    this.data.commentId = options.commentId
    this.data.forumNumber = options.forumNumber
    //获取回复列表数据
    this.getAnswerList()

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];   //上一个页面---帖子详情页面
    let list = prevPage.data.commentList
    if (list.length>0){
      for (let i = 0; i < list.length;i++){
        if (options.commentId == list[i].commentId){
          this.setData({ note: list[i] })
          return false
        }
      }
    }
    console.log(prevPage.data.commentList)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.common.showToast("数据刷新中...")
    this.setData({
      answerList: [],
      pageNumber: 1,
      loadMore: true,
    })
    this.getAnswerList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    let count = this.data.count
    let loadMore = this.data.loadMore
    let length = this.data.answerList.length
    if (loadMore && (count > length)) {
      //触底加载更多数据
      this.getAnswerList()
    }
  },
  //获取回复列表
  getAnswerList() {
    let data = {
      "commentId": this.data.commentId,
      "pageNum": this.data.pageNumber,
      "pageSize": 10,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
    }
    app.wxApi.wxPost("api-tribune/comment/getCommentHfList",data)
      .then(res => {
        console.log("获取回复列表",res)
        if(res.statusCode ==200){
          //let array = this.data.answerList
          let array = []
          let list = res.data.data.dataList
          if(list.length>0){
            for(let i =0;i<list.length;i++){
              list[i].commentTime = list[i].commentTime.substring(0,10)
              array.push(list[i])
            }
            this.setData({ answerList: array,count : res.data.data.count })
          }

        }
      })
  },
  //input失去焦点，重置
  tapEvent() {
    app.common.checkProhibit(app, this)
  },
  checkCont(e) {
    let value = e.detail.value
    this.setData({ inputValue: value })
  },
  //发布评论
  submitComment() {
    let lock = this.data.lock
    let value = this.data.inputValue
    let data = {
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      commentContext: value,
      forumNumber: this.data.forumNumber,
      parentId: this.data.commentId
    }
    if (lock) return false
    app.common.submitComment(app, data, "answer", this)
  },
  //查看其他人资料
  lookOtherPage(e) {
    app.common.lookOther(app,e) // 查看其他人
  },
})