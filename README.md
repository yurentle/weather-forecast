# weather-forecast
描述 : 天气预报，响应式布局，使用技术有：vue，latlon-geohash，百度地图api获取当前城市，
中文转成拼音的工具（调用的天气api的url中城市字段需要为拼音）
## 简介
仿照[Weample Weather](https://play.google.com/store/apps/details?id=pl.drobek.krzysztof.wemple)完成在PC端以及手机端通用的天气应用。
调用[openweathermap](https://openweathermap.org/api)的api获取需要的天气数据

- 主页面。
    - 打开页面自动获取当前地址，显示当前城市的天气情况、每3小时的天气预报
    - 点击时钟按钮切换显示未来16天的天气预报

- 侧边栏
    - 侧边栏里有用户关注的城市列表和添加城市功能
    - 添加城市后，城市将以卡片形式显示在输入框下面
    - 卡片形式的城市列表第一个为当前位置的城市，不可删除，其他添加的城市可以删除关注
    - 城市列表在 Local Storage 里保存，每次打开页面时读取


