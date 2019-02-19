

const app  = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    disabled: true,
    num: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("留言")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 获取文本域内容，统计字数   .replace(/(^\s*)|(\s*$)/g, "")
   */
  getCont: function (e) {
    
    let val = e.detail.value;
    let that = this;
    let len = 0;
    let disabled = true
    if (val.length > 0) {
      disabled = false
      len = val.length;
      if (len >= 500) len = 500;
    }
    that.setData({
      num: len,
      disabled: disabled
    });
    return val.substring(0, 500);
  },
  /**
   * 保存用户输入的留言内容
   */
  feedback: function (e) {
    let _this = this
    let value = e.detail.value.content
    if (!value) {
      app.Toast.Toast({ content: "请输入留言内容" })
      return false
    }
    let data = {
      "userNumber": app.userMsg.userNumber,
      "tokenNumber": app.userMsg.tokenNumber,
      "text": value,
    }
    console.log(data)
    this.setData({ disabled: true })
    //文字检测是否合法
    app.wxApi.wxPost("api-media/aiCheck/checkText", { str: value })
      .then(res => {
        this.setData({ disabled: false })
        console.log("文本检测",res)
        
        if (res.statusCode == 200 && res.data.code == 1) {
          //进行保存
          this.setData({ disabled: true })
          app.wxApi.wxPost("api-tribune/leave/addLeave",data)
          .then( res => {
            console.log("保存结果",res)
            if (res.statusCode == 200 && res.data.code == 1){
              app.Toast.Toast({ content: res.data.msg })
              setTimeout(()=>{
                _this.setData({ disabled: false })
                wx.navigateBack({
                  delta:1
                })
              },800)
            }else{
              this.setData({ disabled: false })
              app.Toast.Toast({ content: res.data.msg })
            }
          })
        } else {
          app.Toast.Toast({ content: res.data.msg })
        }
      })
  },
})