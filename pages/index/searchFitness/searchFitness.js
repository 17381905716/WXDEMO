const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    pageNumber: 1,
    loading: false,
    noFitnessData: true,
    fitness: [],
    keyWord: '',
    noFitnessImg: "/images/index/home_icon_gym_no@3x.png",
    business: "/images/index/home_icon_bu_ing@3x.png",
    rest: "/images/index/home_icon_bu_n@3x.png",
    wait: "/images/index/home_icon_bu_wa@3x.png",

    openImg: "/images/index/home_icon_open@2x.png",
    closeImg: "/images/index/home_icon_clo@2x.png",

    noDataImg: app.img.noDataImg1, 
    starImg: app.img.starImg,  
    noStarImg: app.img.noStarImg,
    array: [0, 1, 2, 3, 4],
    lock:false, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.common.navTitle("搜索健身房")
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];   //上一个页面
    this.data.longitude = prevPage.data.longitude
    this.data.latitude = prevPage.data.latitude
    //this.data.searchId = prevPage.data.searchId
    
  },
  //输入关键字搜索
  valueSearch(e){
    this.setData({ keyWord: e.detail.value, fitness: [], pageNumber: 1, noFitnessData: true })
    if (e.detail.value)this.searchFitness(e.detail.value)
  },
  /**
   * 搜索健身房
   */
  searchFitness: function (value) {
    let _this = this
    let lock = _this.data.lock
    //调用搜索健身房方法
    let data = {
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      //fitnessTypeId: this.data.searchId,
      advertCity: app.cityInfo.cityId,
      pageNumber: this.data.pageNumber,
      tokenNumber: app.userMsg.tokenNumber,
      userNumber: app.userMsg.userNumber,
      likeParam: value
    }
    console.log(data)
    if(!lock){
      _this.data.lock = true
      app.wxApi.wxPost("api-fitness/fitness/getFitnessList", data)
        .then(res => {
          if(res.statusCode == 200){
            _this.data.lock = false
            console.log("关键字搜索健身房", res)
            let oldFitness = _this.data.fitness
            let fitness = res.data.data;
            let noData = false
            if (fitness.length > 0) {
              for (let i = 0; i < fitness.length; i++) {
                fitness[i].distance = fitness[i].distance.toFixed(1)
                let activity = fitness[i].fitnessActivities
                if (activity.length > 0) {
                  for (let j = 0; j < activity.length; j++) {
                    activity[j].fitnessActivityPrice = activity[j].fitnessActivityPrice.toFixed(1)
                  }
                }
                oldFitness.push(fitness[i])
              }
            }
            if (oldFitness.length == 0) noData = true  //无数据
            _this.setData({ fitness: oldFitness, noFitnessData: noData, count: res.data.count, loading: false })
          }
        })
    }
  },
  /**
   * 跳转到健身房详情
   */
  toDetail: function (e) {
    console.log(e)
    let fitnessNumber = e.currentTarget.dataset.number;
    wx.navigateTo({
      url: '/pages/index/detail/detail?fitnessNumber=' + fitnessNumber,
    })
  },
  //图片加载完成
  loadSuccess(e) {
    let fitness = this.data.fitness
    let num = e.currentTarget.dataset.number
    if (fitness.length > 0) {
      for (let i = 0; i < fitness.length; i++) {
        if (num == fitness[i].fitnessNumber) {
          fitness[i].success = true
          this.setData({ fitness: fitness })
          break;
        }
      }
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
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let count = this.data.count
    let length = this.data.fitness.length
    if (count > length ) {
      //触底加载更多数据
      this.setData({ loading: true })
      this.data.pageNumber ++
      this.searchFitness(this.data.keyWord)
    }
  },
})