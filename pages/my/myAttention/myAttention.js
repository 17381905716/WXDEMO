// pages/my/myAttention/myAttention.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    // pageNumber: 1,
    // loadMore: true,
    noDataText: '您还没有关注他人',
    myFollow: "/images/public/myfollow_icon_no@3x.png",
    followType: 1,
    select: [
      { text: "我的关注", type: 1, checked: true },
      { text: "关注我的", type: 2, checked: false },
    ],
    myAtent:[
      // { id: 1, img: "", name: "巫婆婆的猫1", date: "2018-07-26" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("我的关注")
    this.attentionList(this.data.followType)
  },
  /**
   * 选择我的关注或关注我的，加载对应数据
   */
  select: function (e) {
    let _this = this;
    let notData = false;
    let noDataText = ''
    let type = e.currentTarget.dataset.type;
    let data = this.data.select;
    if (this.data.followType == type ) return false
    console.log("切换",e)
    for (let i = 0; i < data.length; i++) {
      if (type == data[i].type) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    if (type == 1) noDataText = "您还没有关注他人"
    if (type == 2) noDataText = "暂时还没有人关注您"
    console.log(data)
    _this.setData({ select: data, noData: false, followType: type, noDataText: noDataText, myAtent: []})
    //调用接口获取数据
    _this.attentionList(type)
  },
  /**
 * 获取我的关注数据
 */
  attentionList(type) {
    let _this = this
    let fun = '';
    let data = {
      userNumber: app.userMsg.userNumber,
      tokenNumber: app.userMsg.tokenNumber,
    }
    //
    if (type == 1) fun = "api-user/other/getMyFollowList" //我关注的，
    if (type == 2) {
      data.othersUserNumber = app.userMsg.userNumber
      fun = "api-user/other/getFansList" //关注我的
    }
    
    console.log(data)
    app.wxApi.wxPost(fun, data)
      .then(res => {
        console.log(res)
        if(res.statusCode == 200){
          if (res.data.code == 10032){
            this.setData({ noData:true})
          }
          if (res.data.code == 1){
            let list = res.data.data
            let array = this.data.myAtent
            if (list == null || list.length == 0) this.setData({ noData : true,loadMore: false}) 
            if(list.length > 0){
              // if (list.length < 10) this.setData({ loadMore: false }) 
              // if (list.length == 10 ) this.data.pageNumber ++
              for(let i = 0;i < list.length; i++){
                array.push(list[i])
              }
            }
            _this.setData({ myAtent: array})
          }
        }else{
          app.common.showToast("网络错误");
        }
      })
  },
  //跳转到查看其他人页面
  lookOtherPage(e){
    app.common.lookOther(app, e) // 查看其他人
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    //app.common.showLoading("数据刷新中···")
    app.common.showToast("数据刷新中...")
    this.setData({
      myAtent: [],
      // pageNumber: 1,
      // loadMore: true,
    })
    this.attentionList(this.data.followType)
    setTimeout(() => {
      wx.stopPullDownRefresh()
      //app.common.hideLoading()
    }, 1500)
  },
  //触底事件---加载更多数据
  onReachBottom: function () {
    // console.log("触底事件---加载更多数据")
    // let loadMore = this.data.loadMore
    // if (loadMore) {
    //   //触底加载更多数据
    //   this.attentionList(this.data.followType)
    // }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
})