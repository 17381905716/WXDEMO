// pages/my/inviteFriend/inviteFriend.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inviteImg: app.img.inviteImg,
    wayData:[
      { text: "邀请微信好友", img: "/images/my/invite_icon_wechat@3x.png", type: 1 },
      { text: "邀请QQ好友", img: "/images/my/invite_icon_qq@3x.png", type: 2 },
      { text: "邀请微博好友", img: "/images/my/invite_icon_weibo@3x.png", type: 3 },
    ],
    inviteData:[
      { id: 1, img: "", name: "巫婆婆的猫1", date:"2018-07-20" },
      { id: 2, img: "", name: "巫婆婆的猫2", date: "2018-07-21" },
      { id: 3, img: "", name: "巫婆婆的猫3", date: "2018-07-22" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("邀请好友")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 邀请好友
   */
  inviteFriend(e){
    let type = e.currentTarget.dataset.type;
    console.log(e)
  },
})