
/**
 * 页面标题方法
 * @params title为页面标题
 * @params fontColor为字体颜色 (仅支持#000000和#ffffff)
 * @params bgColor为背景颜色
 * @author wf
 * **/
function navTitle(title, fontColor = '#000000', bgColor = '#ffffff') {
  wx.setNavigationBarTitle({
    title: title
  });
  wx.setNavigationBarColor({
    frontColor: fontColor,
    backgroundColor: bgColor
  })
}
/**
 * 提示消息
 * @params content为提示的内容
 * @params icon为图标
 * @author wf
 * **/
function showToast(content, icon = 'loading', duration =1500) {
  //自定义图片
  //let image = "/images/test.png";
  wx.showToast({
    title: content,
    icon: icon,
    duration: duration,
    mask: true,
    //image:image
  })
}
//模态框长时间提示
function showLoading(cont,mask = true){
  wx.showLoading({
    title: cont,
    mask: mask
  })
}
//结束模态框提示
function hideLoading(){
  setTimeout(() => {
    wx.hideLoading();
  }, 100)
}

/** 确定、取消模态弹窗 */
function showModel(){
  wx.showModal({
    title: '',
    content: '',
    showCancel: true, //是否显示取消按钮
    cancelText: '取消',
    cancelColor: '', //颜色 
    confirmText: '确定',
    confirmColor : '',
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    },
    fail:function(){res}

  })
}
// 显示操作菜单
function showActionSheet(){
  wx.showActionSheet({
    itemList: ["第一个A","B","C"], // 按钮的文字数组，数组长度最大为6个
    itemColor: '#00ff00', //按钮的文字颜色，默认为"#000000"
    success: function (res) {
      console.log(res.tapIndex)
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  });
}

/** 页面滚动到目标位置 */
function pageScrollTo(scrollTop = 0, duration = 300){
  wx.pageScrollTo({
    scrollTop: scrollTop,
    duration: duration
  })
}

/** 设置缓存 */
function storage(key, val) {
  return wx.setStorageSync(key, val)
}
/** 获取缓存 */
function getStorage(storage) {
  return wx.getStorageSync(storage);
}

function animation(currentStatu, page) {
  /* 动画部分 */
  // 第1步：创建动画实例 
  let animation = wx.createAnimation({
    duration: 200, //动画时长 
    timingFunction: "linear", //线性 
    delay: 0 //0则不延迟 
  });

  // 第2步：这个动画实例赋给当前的动画实例 
  page.animation = animation;

  // 第3步：执行第一组动画 
  animation.opacity(0).rotateX(-100).step();

  // 第4步：导出动画对象赋给数据对象储存 
  page.setData({
    animationData: animation.export()
  })

  // 第5步：设置定时器到指定时候后，执行第二组动画 
  setTimeout(function () {
    // 执行第二组动画 
    animation.opacity(1).rotateX(0).step();
    // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
    page.setData({
      animationData: animation
    })

    //关闭 
    if (currentStatu == "close") {
      page.setData({
        showModalStatus: false
      });
    }
  }.bind(page), 200)

  // 显示 
  if (currentStatu == "open") {
    page.setData({
      showModalStatus: true
    });
  }
}
//判断是图片还是视频
function judgeType(url){
  let src = ''
  if(!url) return false
  let index = url.lastIndexOf(".")
  if (index > 0) {
    let name = url.substring(index + 1, url.length)
    name = name.toLowerCase()
    if (name == 'mp4' || name == 'avi' || name == 'wav' || name == 'mov') src = ''
    if (name == 'jpg' || name == 'png' || name == 'jpeg' || name == 'gif') src = url
  }
  return src
}
//检测是否是网络图片
function judgeNetImage(src){
  let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/  //正则验证是否是网络图片
  return reg.test(src)
}
//获取当前时间，格式YYYY-MM-DD
function getNowDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}
//收藏帖子、视频、课程、店铺
function collect(app, data, collect, that){
  
  let detail = ''
  let cType = Number(data.collectType)
  if (cType === 1) detail = that.data.newsDetail  //帖子收藏 
  if (cType === 2) detail = that.data.courseDetail  //课程收藏
  if (cType === 3) detail = that.data.videoDetail //视频收藏
  if (cType === 4) detail = that.data.fitnessData  //店铺收藏 
  console.log(app, "------", detail, cType )
  //收藏视频、帖子
  if (collect == 0) {
    app.wxApi.wxPost("api-user/user/collections", data)
      .then(res => {
        console.log("收藏课程/视频/帖子/店铺----", res,"cType值：",cType)
        if (cType === 3){
          app.common.showToast(res.data.msg, "success")
        }else{
          app.Toast.Toast({ content: res.data.msg })
        }
        if (res.statusCode == 200 && res.data.code == 1) {
          //收藏成功，刷新数据
          detail.isCollect = 1
          if (cType === 1) that.setData({ newsDetail: detail })
          if (cType === 2) that.setData({ courseDetail: detail })
          if (cType === 3)that.setData({ videoDetail: detail })
          if (cType === 4) that.setData({ fitnessData: detail })
        }
      })
  } else {  //取消收藏  
    app.wxApi.wxPost("api-user/user/cancelCollections", data)
      .then(res => {
        console.log("取消收藏课程/视频/帖子/店铺---", res)
        //app.Toast.Toast({ content: res.data.msg })
        if (cType === 3) {
          app.common.showToast(res.data.msg, "success")
        } else {
          app.Toast.Toast({ content: res.data.msg })
        }
        if (res.statusCode == 200 && res.data.code == 1) {
          //关注成功，刷新数据
          detail.isCollect = 0
          if (cType === 1) that.setData({ newsDetail: detail })
          if (cType === 2) that.setData({ courseDetail: detail })
          if (cType === 3) that.setData({ videoDetail: detail })
          if (cType === 4) that.setData({ fitnessData: detail })
        }
      })
  }
}
//关注他人（帖子详情，课程详情，视频播放详情，查看其他人）
function aboutOther(app, data, about,sourse, that){
  let detail = ''
  if (sourse === 'newsDetail') detail = that.data.newsDetail // 帖子详情---关注他人  
  if (sourse === 'courseDetail') detail = that.data.courseDetail  // 课程详情---关注他人
  if (sourse === 'videoDetail') detail = that.data.videoDetail  // 视频播放详情---关注他人
  if (about == 1) { //已关注---进行取消关注
    app.wxApi.wxPost("api-tribune/findfollow/unFollow", data)
      .then(res => {
        console.log("取消关注他人", res)
        app.Toast.Toast({ content: res.data.msg })
        if (detail )detail.isFollow = 0
        if (res.statusCode == 200 && res.data.code == 1) {
          if (sourse === 'lookOther') that.setData({ isFollow: 0 })
          if (sourse === 'newsDetail') that.setData({ newsDetail: detail })
          if (sourse === 'courseDetail') that.setData({ courseDetail: detail })
          if (sourse === 'videoDetail') that.setData({ videoDetail: detail })
        }
      })
  } else {  //未关注---进行关注
    app.wxApi.wxPost("api-tribune/findfollow/addFollow", data)
      .then(res => {
        app.Toast.Toast({ content: res.data.msg })
        if (detail) detail.isFollow = 1
        if (res.statusCode == 200 && res.data.code == 1) {
          if (sourse === 'lookOther') that.setData({ isFollow: 1 })
          if (sourse === 'newsDetail')that.setData({ newsDetail: detail })
          if (sourse === 'courseDetail') that.setData({ courseDetail: detail })
          if (sourse === 'videoDetail') that.setData({ videoDetail: detail })
        }
      })
  }
}
//帖子评论、回复，提交保存方法
function submitComment(app, data,sourse, that){
  if (data.commentContext) {
    //执行文字审核  api-media/aiCheck/checkText
    that.data.lock = true
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: data.commentContext })
      .then(res => {
        console.log("文字审核结果", res)
        that.data.lock = false
        if (res.statusCode == 200 && res.data.code == 1) {
          that.data.lock = true
          app.wxApi.wxPost("api-tribune/comment/addComment", data)
            .then(res => {
              console.log("发布评论提交结果", res)
              if (res.statusCode == 200) {
                that.data.lock = false
                app.Toast.Toast({ content: res.data.msg })
                if (res.data.code == 1) {
                  that.setData({
                    answerList: [],
                    commentList: [],
                    pageNumber: 1,
                    loadMore: true,
                    autoFocus: false,
                    inputValue: ''
                  })
                  if (sourse === 'comment') that.getCommentList()
                  if (sourse === 'answer') that.getAnswerList()
                }
              }
            })
        }
        //文本检测不合格，包含敏感词
        if (res.statusCode == 200 && res.data.code == 10037) {
          app.Toast.Toast({ content: res.data.msg })
          return false
        }
      })
  } else {
    app.Toast.Toast({ content: "请输入评论内容" })
  }
}
//检测是否禁言
function checkProhibit(app,that){
  let prohibit = app.userMsg.userInfo.isAnExcuse  //1未禁言，2已被禁言
  let dayAnExcuse = app.userMsg.userInfo.dayAnExcuse //禁言天数
  //let startAnExcuse = app.userMsg.userInfo.startAnExcuse  //开始禁言时间
  //检测是否被禁言，计算禁言天数
  if (prohibit == 1) {
    that.setData({ disable: false, autoFocus: true })
    return true
  }
  if (prohibit == 2) {
    that.setData({ disable: true, autoFocus: false })
    wx.showModal({
      title: '您被禁言',
      content: '您将于' + dayAnExcuse + '天后解除禁言',
      showCancel: false,
      success: function () {
      },
    })
    return false
  }
}
// 查看其他人 
function lookOther(app,event){
  let num = event.currentTarget.dataset.num;
  if (num) {
    wx.navigateTo({
      url: '/pages/my/lookOther/lookOther?otherNumber=' + num,
    })
  } else {
    app.common.showToast("不能查看该用户")
  }
}
//获取网络状态
function getNetWork(app){
  wx.getNetworkType({
    success(res) {
      console.log("获取网络状态", res)
      if (res.networkType == "none") {
        app.Toast.Toast({ content: "当前无网络，请稍后再试" })
        return false
      }
      if (res.networkType == "2g" || res.networkType == "3g") {
        app.Toast.Toast({ content: "当前网络信号不稳定" })
        return false
      }
    }
  })
}
// 获取用户信息
function getUserInfo(app,that){
  let data = {
    userNumber: app.userMsg.userNumber,
    tokenNumber: app.userMsg.tokenNumber,
  }
  app.wxApi.wxPost("api-user/user/getUserAccount", data)
    .then(res => {
      console.log("用户信息", res)
      if (res.statusCode == 200 && res.data.code == 1) {
        res.data.data.balance = res.data.data.balance.toFixed(2)
        res.data.data.redPacketMoney = res.data.data.redPacketMoney.toFixed(2)
        app.userMsg.userInfo = res.data.data
        that.setData({
          userInfo: res.data.data
        })
      }
    })
}
/**出口供调用**/
module.exports = {
  navTitle: navTitle,
  storage: storage,
  getStorage: getStorage,
  showToast: showToast,
  showActionSheet: showActionSheet,
  pageScrollTo: pageScrollTo,
  animation: animation,
  showLoading: showLoading,
  hideLoading: hideLoading,
  judgeType: judgeType,
  judgeNetImage: judgeNetImage,
  getNowDate: getNowDate,
  collect: collect, // 收藏
  aboutOther: aboutOther, // 关注他人
  checkProhibit: checkProhibit,  //   检测用户是否禁言
  submitComment: submitComment,  //  帖子的评论和回复
  lookOther: lookOther,  // 查看其他人
  getNetWork: getNetWork,
  getUserInfo: getUserInfo,  // 获取用户信息
}