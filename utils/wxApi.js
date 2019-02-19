var Promise = require('../plugins/es6-promise.js')

//let apiUrl = "https://gym.wenqi.xin/";

let apiUrl = "http://132.232.92.28:9002/"

//let apiUrl2 = "http://des1gn.iicp.net:23747/"

//let apiUrl = "http://kylin-hsk.imwork.net:43879/";

let upUrl = apiUrl + "api-media/upload/" 

let loginOut = false  // 出现登录过期时的标识

let netStatus = false 

function wxPromisify(fn) {
  wx.getNetworkType({
    success(res) {
      if (res.networkType == "none") {
        wx.showToast({
          title: '当前无网络',
          icon: "loading"
        })
        return false
      }
      if (res.networkType == "2g" || res.networkType == "3g") {
        if(!netStatus){
          netStatus = true
          wx.showToast({
            title: '网络不稳定',
            icon: "loading"
          })
          setTimeout(()=>{
            netStatus = false
          },60000)
        }
        
      }
    }
  })
  return function (obj = {}) {        
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        if (res.statusCode == 200 && res.data.code == 10029){
          if (loginOut) return false
          loginOut = true
          wx.showModal({
            title: '',
            content: '登录已过期，是否回到首页重新登录',
            showCancel: true,
            success:function(res){
              loginOut = false
              if(res.confirm){
                wx.reLaunch({
                  url: '/pages/index/index?relogin=1',
                })
              }else{
                wx.showModal({
                  title: '',
                  showCancel: false,
                  content: '您将不能正常使用小程序',
                })
              }
            }
          })
        }
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
        reject(res)
      }
      fn(obj)
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) { 
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
/**
 * 微信用户登录,获取code
 */
function wxLogin() {
  return wxPromisify(wx.login)
}
/**
 * 获取微信用户信息
 * 注意:须在登录之后调用
 */
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}
/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}
/**
 * 获取位置信息
 */
function wxGetLocation(){
  return wxPromisify(wx.getLocation);
}

/**
 * get方法请求接口
 * url接口地址
 * data 为参数对象
 */
function getRequest(url, data) {
  var getRequest = wxPromisify(wx.request)
  return getRequest({
    url: apiUrl + url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json'
    }
  })
}
/**
 * post方法请求接口
 * url接口地址
 * data 为对象
 */
function postRequest(url, data, urlType = 1, headerType = 'json') {
  let postRequest = wxPromisify(wx.request)
  let header = {
    'Content-Type': 'application/json'
  }
  let funUrl = apiUrl + url
  //if (urlType === 2) funUrl = apiUrl2 + url
  if (headerType == "form") {
    header = {
      "content-type": "application/x-www-form-urlencoded"
    }
  }
  return postRequest({
    url: funUrl ,
    method: 'POST',
    data: data,
    header: header
  })
}
module.exports = {
  wxPromisify: wxPromisify,
  wxLogin: wxLogin,
  wxGetUserInfo: wxGetUserInfo,
  wxGetSystemInfo: wxGetSystemInfo,
  wxGetLocation: wxGetLocation,
  wxGet: getRequest,
  wxPost: postRequest,
  upUrl: upUrl, 
}