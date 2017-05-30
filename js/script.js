const CITIES_STORAGE = 'weatherPro'
let citiesStorge = {
    // 回取本地城市名称数据
    fetch: function() {
        let cities = JSON.parse(localStorage.getItem(CITIES_STORAGE))
        return cities
    },
    // 存储本地城市名称数据
    save: function(cities) {
        localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities))
    }
}
let app = new Vue({
    el: '#app',
    data: {
        // 当前城市(默认城市)
        currentCity: '',
        geoCity: '',
        select: false,
        GEO: {
            latitude: '',
            longitude: ''
        },
        // 获取本地localStorage存储城市数据
        cities: citiesStorge.fetch(),
        // 输入框输入的城市
        newCity: '',
        // 通用字符
        begin: 'http://api.openweathermap.org/data/2.5/',
        // openweathermap id
        id: '6b5537cd39eac5d2b02dce11bd27a9e4',
        // 当前实时天气数据
        currentWeatherData: {
            main: {
                humidity: '',
                temp: '',
                pressure: ''
            },
            weather: [{
                main: '',
                icon: '04n'
            }],
            wind: {
                speed: ''
            },
            clouds: {
                all: ''
            },
            dt: 0
        },
        // 是否显示每日天气数据
        // 默认只有两种天气显示
        isDaily: false,
        // 每日天气数据
        dailyWeatherData: {},
        // 每日实时天气数据
        hourlyWeatherData: [],
        // 星期转换
        weekTable: {
            "Mon": "星期一",
            "Tue": "星期二",
            "Wed": "星期三",
            "Thu": "星期四",
            "Fri": "星期五",
            "Sat": "星期六",
            "Sun": "星期天"
        },
        // 侧边栏是否被拉出
        showMenu: false,
        // 搜索框是否被拉下
        dropDown: false,
        // 用于标记当前选择的城市的index序号
        currentCityIndex: 0
    },
    // 观测cities的变化
    watch: {
        cities: {
            handler: function(cities) {
                citiesStorge.save(cities)
            },
            deep: true
        }
    },
    computed: {
        upperCaseHeader: function() {
            return this.currentCity
        }
    },
    // 方法
    methods: {
        // 找到当前城市组里的第一个城市
        getCurrentCity: function() {
            // 在本地localstorage搜索处于选中状态的城市
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].isSelected) {
                    this.currentCity = this.cities[i].name
                    this.currentCityIndex = i
                    break
                }
            }
        },
        getCity: function() {
            let _this = this
            let url = 'http://api.map.baidu.com/geocoder/v2/?location=' + this.GEO.latitude + ',' + this.GEO.longitude + '&output=json&pois=1&ak=IY1EUbRdisrNv1gr79QBderTndkv0MaD'
            JSONP.get(url, {param1:'a', param2:'b'}, function(response) {
                console.log(response)
                _this.geoCity = response.result.addressComponent.city
                _this.currentCity = _this.geoCity
                _this.cities.map(function(x){
                    x.isSelected = false
                })
                _this.cities[0]=({
                    "name": _this.geoCity,
                    "isSelected": true
                })
            })
        },
        getLocation() {
            if (navigator.geolocation) {
                 let options = {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 0
                }
                navigator.geolocation.getCurrentPosition(this.success, this.error, options)
            }else{
                alert('你的浏览器不支持获取地址功能')
            }
        },
        success(position) {
            let lat = position.coords.latitude
            let lng = position.coords.longitude
            this.geohash = Geohash.encode(lat, lng) 
            this.GEO.latitude = lat
            this.GEO.longitude = lng
            this.getCity()
        },
        error() {
             this.GEO.latitude = 39.98537
             this.GEO.longitude = 116.316798
             this.geohash = Geohash.encode(this.GEO.latitude, this.GEO.longitude) 
             this.getCity()
             alert('获取地址失败，已显示默认地址')
        },
        // 点击calendar按钮或是时间按钮转换显示内容
        changeTime: function() {
            this.isDaily = !this.isDaily
        },
        // 点击左上角按钮切换状态
        // 还包含控制侧边栏的显示隐藏功能
        isMenu: function() {
            this.showMenu = !this.showMenu
        },
        // 获取星期信息
        getWeek: function(number) {
            let tempTime = new Date(number * 1000)
            let week = tempTime.toDateString().split(' ')
            return {
                // 星期名称
                weekName: this.weekTable[week[0]],
                // 日期
                date: week[1] + "-" + week[2],
                // 单个日期 几号
                singleDate: week[2],
                // 精确到几点发布
                presTime: tempTime.toLocaleTimeString()
            }
        },
        // 与analyArray 相关
        initArray: function(array, number) {
            return {
                hourly: [
                    array[number]
                ]
            }
        },
        // 分析每日小时数据
        analyArray: function(array) {
            let over = []
            let start = this.initArray(array, 0)
            over.push(start)
            for (let i = 1; i < array.length; i++) {
                if (this.getDay(array[i].dt) === this.getDay(array[i - 1].dt)) {
                    over[over.length - 1].hourly.push(array[i])
                } else {
                    over.push(this.initArray(array, i))
                }
            }
            return over
        },
        // 得到是第几天
        getDay: function(string) {
            return new Date(Number(string) * 1000).toString().split(' ')[2]
        },
        // 添加地点
        // 引起搜索框下拉
        addlocation: function() {
            this.dropDown = true
        },
        // 把搜索展示框提拉回去的动作
        backUp: function() {
            this.dropDown = false
        },
        // 增加一个城市
        addCity: _.debounce(
            function() {
                // 添加一个城市不会有重新init的步骤
                // init都在deleteCity-selectCity以及程序初始化时候处理
                let cities = this.cities;

                // 检测是否有重复的地理名称
                // 如果有返回
                for (let i = 0; i < cities.length; i++) {
                    if (cities[i].name === this.newCity.trim()) {
                        return
                    }
                }
                // 添加城市数量上限是7个
                if (cities.length >= 7) {
                    return
                }
                // 首字母大写化
                let upperCase = this.newCity[0].toUpperCase();
                // 添加到第一位置
                cities.push({
                    "name": this.newCity.replace(/^\w/gi, upperCase),
                    'isSelected': false
                })
                this.newCity = "";

            }, 500
        ),
        // 删除一个城市
        deleteCity: function(index) {
            let length = this.cities.length;
            // 至少城市列表要有一个城市
            if (length === 1) { return }
            for (let i = 0; i < length; i++) {
                if (index === i) {
                    this.cities.splice(i, 1)
                    break
                }
            }
            // 如果当前要删除的城市正好是处于城市列表选中的城市 那么让第一个城市选中
            if (this.currentCityIndex === index) {
                this.currentCityIndex = 0
                this.currentCity = this.cities[0].name
                this.cities[0].isSelected = true;
                // 第一个城市被选中了 搜索
                this.init()
            }
            // 如果当前要删除的城市的index序号小于处于选中状态的城市的序号
            if (this.currentCityIndex > index) {
                this.currentCityIndex--;
                this.currentCity = this.cities[this.currentCityIndex].name
                this.init()
            }
            // 如果当前要删除的城市的index序号大于处于选中状态的城市的序号
            // 不会有初始化的要求
        },
        // 在城市列表中选中一个城市
        selectCity: function(index) {
            // 之前选中的城市变为非选中
            this.cities.map(function(x){
                    x.isSelected = false
            })
            // 本城市被选中
            this.cities[index].isSelected = true;
            // currentCity更新
            this.currentCity = this.cities[index].name
            this.currentCityIndex = index;
            // 选中该城市后搜索该城市天气信息
            this.init()
        },
        // 刷新
        refresh: function() {
            this.init()
        },
    
        // 程序入口 初始化,用convert方法将中文转为拼音以符合api的调用方式
        init: function() {
            // 实时天气预报
            let currentUrl = `${this.begin}weather?q=${convert(this.currentCity)}&appid=${this.id}&units=metric&lang=zh_cn`
            let that = this;
            axios.get(currentUrl).then(function(response) {
                that.currentWeatherData = response.data
            });

            // 每日天气预报
            let weekUrl = `${this.begin}forecast/daily?q=${convert(this.currentCity)}&appid=${this.id}&units=metric&lang=zh_cn&cnt=16`
            axios.get(weekUrl).then(function(response) {
                that.dailyWeatherData = response.data
            })

            // 每日小时天气预报
            let hourlyUrl = `${this.begin}forecast?q=${convert(this.currentCity)}&appid=${this.id}&units=metric&lang=zh_cn`
            axios.get(hourlyUrl).then(function(response) {
                that.hourlyWeatherData = that.analyArray(response.data.list)
            })
        }
    },
    mounted: function() {
        // 获取当前城市与搜索城市天气信息分开处理
        this.getCurrentCity();
        this.init()
        this.getLocation() 
    }
})