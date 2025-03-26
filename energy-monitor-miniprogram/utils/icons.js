// 图标工具类
const icons = {
  // 底部导航栏图标
  tabBar: {
    home: {
      normal: '/images/home.png',
      selected: '/images/home_selected.png'
    },
    trend: {
      normal: '/images/trend.png',
      selected: '/images/trend_selected.png'
    },
    history: {
      normal: '/images/history.png',
      selected: '/images/history_selected.png'
    },
    settings: {
      normal: '/images/settings.png',
      selected: '/images/settings_selected.png'
    }
  },

  // 状态图标
  status: {
    success: '/images/success.png',
    warning: '/images/warning.png',
    error: '/images/error.png'
  },

  // 获取图标路径
  getIcon(type, name, isSelected = false) {
    if (type === 'tabBar') {
      return isSelected ? this.tabBar[name].selected : this.tabBar[name].normal;
    }
    return this.status[name];
  }
};

export default icons; 