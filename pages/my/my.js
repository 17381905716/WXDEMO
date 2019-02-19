
const { $Toast } = require('../../dist/base/index.js');
const app= getApp()
Page({
  //页面的初始数据
  data: {
    userInfo: '',
    setImg: "/images/my/my_set@3x.png",
    crownImg: app.img.vipCrown,
    vipImg1: "/images/my/my_icon_vip_no@2x.png",
    // vipImg2: "/images/my/other_icon_vip@3x.png",
    bgImg: app.img.myInfoBg,
    myWalletImg: app.img.myWalletImg,
    memberImg: app.img.memberImg,
    menu: [
      { img: "/images/my/wallet@1.png", cont: "优惠券", type: "voucher", width: 50, height: 42 },
      { img: "/images/my/wallet@2.png", cont: "兑换鼓励金", type: "drawcash", width: 52, height: 42 },
      { img: "/images/my/wallet@3.png", cont: "充值", type: "recharge", width: 50, height: 48 },
      { img: "/images/my/wallet@4.png", cont: "会员", type: "vip", width: 50, height: 42  },
    ],
    server : [
      { img: "/images/my/my-server@1.png", cont: "我的订单", type: "order", width: 38, height: 46, bg: '#ecfff9', color:'#549883' },
      { img: "/images/my/my-server@2.png", cont: "邀请好友", type: "inviteFriend", width: 46, height: 50, bg: '#f1fff6', color: '#61A579'  },
      { img: "/images/my/my-server@3.png", cont: "联系客服", type: "customerServer", width: 48, height: 42, bg: '#f0fff5', color: '#549B6C'  },
      { img: "/images/my/my-server@4.png", cont: "我的收藏", type: "collect", width: 46, height: 44, bg: '#f9fff1', color: '#7AA342'  },
      { img: "/images/my/my-server@5.png", cont: "我的发帖", type: "posted", width: 46, height: 46, bg: '#f2fff1', color: '#548E4F'  },
      { img: "/images/my/my-server@6.png", cont: "关注和粉丝", type: "myAttention", width: 44, height: 46, bg: '#f0ffff', color: '#4B8F8F'  },
      { img: "/images/my/my_icon_back@2x.png", cont: "留言反馈", type: "feedback", width: 35, height: 44, bg: '#ecfff9', color: '#549883' },
      { img: "/images/my/my-server@8.png", cont: "关于我们", type: "aboutUs", width: 54, height: 40, bg: '#f0fff9', color: '#47B388' },
      
    ],
    novel: [
      { img: "/images/my/novel@1.png", cont: "商城" },
      { img: "/images/my/novel@2.png", cont: "最火游戏" },
    ],
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    let s = Symbol("str");
  },
  //生命周期函数--监听页面显示
  onShow () {
    app.common.getUserInfo(app,this)
  },
  //跳转到充值、冲会员等页面
  walletPage(e){
    let type = e.currentTarget.dataset.type;
    let pageUrl = '';
    if (type == 'voucher'){
      // $Toast({content:"该功能暂未开放"})
      // return false
      pageUrl = "/pages/my/voucher/voucher"
    }
    if (type == 'recharge') pageUrl = '/pages/my/recharge/recharge' //充值页面
    if (type == 'drawcash') pageUrl = '/pages/my/drawcash/drawcash'  //提现页面
    if (type == 'vip') pageUrl = '/pages/my/myMember/myMember'  //会员页面
    if (pageUrl){
      wx.navigateTo({
        url: pageUrl,
      })
    }
  },
   //跳转到服务下的对应子页面
  toServerPage:function(e){
    let page = e.currentTarget.dataset.type;
    let pageUrl = '';
    if (page == "inviteFriend") {
      //if (page == "inviteFriend") pageUrl = "/pages/my/inviteFriend/inviteFriend";   
      $Toast({ content: "该功能暂未开放" })
      return false
    }

    if (page == "order") pageUrl = "/pages/my/order/order";
    if (page == "collect") pageUrl = "/pages/my/collect/collect";
    if (page == "posted") pageUrl = "/pages/my/posted/posted";
     
    if (page == "customerServer") pageUrl = "/pages/my/customerServer/customerServer"; 
    if (page == "myAttention") pageUrl = "/pages/my/myAttention/myAttention";
    if (page == "aboutUs") pageUrl = "/pages/my/aboutUs/aboutUs";
    if (page == "feedback") pageUrl = "/pages/my/feedback/feedback";
    if (pageUrl){
      wx.navigateTo({
        url: pageUrl,
      })
    }else{
      app.common.showToast("暂无页面")
    }
  },
  lookNovel(){
    $Toast({ content: "该功能暂未开放" })
  },
  //查看用户信息
  updateUser(){
    wx.navigateTo({
      url: '/pages/my/updateUser/updateUser',
    })
  },
  //跳转我的会员页面
  memberPage(){
    wx.navigateTo({
      url: '/pages/my/myMember/myMember',
    })
  },
  //查看用户头像大图
  lookUserPhoto(){
    let userPhoto = this.data.userInfo.headImg
    if (!userPhoto) return false
    wx.previewImage({
      urls: [userPhoto],
      success:function(res){
        console.log(res)
      },
    })
  },
  //点击tabBar
  onTabItemTap(item) {
    let nowPage = app.globalData.nowPage
    if (nowPage === 'my') {
      //回到顶部
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      app.globalData.nowPage = 'my'
      return false
    }
  },
  //小程序分享
  onShareAppMessage: function (res) {
    return {
      title: "这么豪华的健身房居然这么便宜",
      imageUrl: app.img.shareImage,
      path: '/pages/index/userLogin/userLogin',
    }
  },
})