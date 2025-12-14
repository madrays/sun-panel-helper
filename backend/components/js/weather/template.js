(function () {
    'use strict';

    // =========== 用户配置区域 - 请根据实际情况修改以下配置 ===========

    // 和风天气配置（每月限额免费）地址：“https://id.qweather.com/”
    const QWEATHER_API_KEY = "XXXXXXXXXX"; // 请替换为您的和风天气API Key
    const QWEATHER_API_HOST = "XXXXXXXXXX"; // 请替换为您的和风天气API Host

    // 高德地图配置（高德开放平台获取个人版本，有限额度免费）地址“https://lbs.amap.com/”
    const AMAP_API_KEY = "XXXXXXXXXX"; // 请替换为您的高德地图API Key

    // AI助手配置（建议使用魔搭社区，每日限额免费）地址：“https://www.modelscope.cn”
    const OPENAI_API_KEY = "XXXXXXXXXX"; // 请替换为您的AI API Key
    const OPENAI_MODEL = "XXXXXXXXXX"; // 请替换为您的AI模型名称,例如"Qwen/Qwen3-VL-235B-A22B-Instruct"
    const OPENAI_BASE_URL = "XXXXXXXXXX"; // 请替换为您的AI API地址，例如“https://api-inference.modelscope.cn/v1”

    // 个人信息配置 - 用于AI生活建议定制
    const USER_PROFILE = {
        age: 26,                    // 您的年龄
        gender: "男",               // 您的性别
        commuteDays: "周一至周六",   // 通勤需求
        commuteMethod: "地铁或公交", // 通勤方式
        coreNeeds: "舒适生活、保持健康、便利出行、优化安排" // 核心需求
    };

    // 默认位置配置
    const DEFAULT_LOCATION = "116.41,39.92"; // 默认经纬度坐标
    const DEFAULT_LOCATION_NAME = "北京";     // 默认位置名称

    // 样式配置
    const VISUAL_TRANSPARENCY = 0.25; // 背景透明度 (0-1)
    const VISUAL_TEXT_COLOR = "#ffffff"; // 字体颜色

    // =========== 插件配置 - 以下配置一般无需修改 ===========
    const weatherConfig = {
        apiKey: QWEATHER_API_KEY,
        apiHost: QWEATHER_API_HOST,
        defaultLocation: DEFAULT_LOCATION,
        locationName: DEFAULT_LOCATION_NAME,
        mobileWidth: 768,
        autoRefresh: true,
        refreshInterval: 300000, // 5分钟
        showOnPC: true,
        showOnMobile: false,
        enableAutoLocation: true,
        amapKey: AMAP_API_KEY,
        openaiApiKey: OPENAI_API_KEY,
        openaiModel: OPENAI_MODEL,
        openaiBaseUrl: OPENAI_BASE_URL,
        userProfile: USER_PROFILE, // 新增用户配置
        transparency: VISUAL_TRANSPARENCY,
        textColor: VISUAL_TEXT_COLOR
    };
    // =========== 配置结束 ===========

    // 工具函数
    const utils = {
        isMobile: () => window.innerWidth <= weatherConfig.mobileWidth,

        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 保存设置到本地存储
        saveSettings(location, locationName) {
            try {
                localStorage.setItem('weather_location', location);
                localStorage.setItem('weather_location_name', locationName);
                localStorage.setItem('weather_auto_location_enabled', 'true');
            } catch (e) {
                console.log('本地存储不可用');
            }
        },

        // 从本地存储加载设置
        loadSettings() {
            try {
                const autoLocationEnabled = localStorage.getItem('weather_auto_location_enabled') === 'true';
                return {
                    location: localStorage.getItem('weather_location') || weatherConfig.defaultLocation,
                    locationName: localStorage.getItem('weather_location_name') || weatherConfig.locationName,
                    autoLocationEnabled: autoLocationEnabled
                };
            } catch (e) {
                return {
                    location: weatherConfig.defaultLocation,
                    locationName: weatherConfig.locationName,
                    autoLocationEnabled: false
                };
            }
        },

        // 获取星期几
        getWeekday(dateStr) {
            const date = new Date(dateStr);
            const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            return weekdays[date.getDay()];
        },

        // 格式化时间 - 从和风天气API的时间格式中提取小时
        formatTime(fxTime) {
            if (!fxTime) return '';
            // 和风天气API返回格式: "2024-01-01T12:00+08:00"
            const timeMatch = fxTime.match(/T(\d{2}):/);
            return timeMatch ? `${timeMatch[1]}:00` : '00:00';
        },

        // 生成折线图的SVG路径 - 完全复刻原有逻辑
        generateTemperatureLine(points, totalWidth, height, itemWidth) {
            if (points.length < 2) return '';

            const allTemps = points.map(item => parseInt(item.temp));
            const minTemp = Math.min(...allTemps);
            const maxTemp = Math.max(...allTemps);
            const range = maxTemp - minTemp;

            let path = '';

            points.forEach((item, index) => {
                const temp = parseInt(item.temp);
                const heightPercent = range === 0 ? 50 : ((temp - minTemp) / range) * 75 + 17.5;
                const x = (index * itemWidth) + (itemWidth / 2);
                const y = height - (heightPercent / 100) * (height * 0.8);

                if (index === 0) {
                    path = `M ${x} ${y}`;
                } else {
                    path += ` L ${x} ${y}`;
                }
            });

            return path;
        },

        // 和风天气图标映射
        getWeatherIcon(code) {
            const iconMap = {
                '100': 'fas fa-sun', // 晴
                '101': 'fas fa-cloud-sun', // 多云
                '102': 'fas fa-cloud-sun', // 少云
                '103': 'fas fa-cloud', // 晴间多云
                '104': 'fas fa-cloud', // 阴
                '150': 'fas fa-moon', // 晴（夜）
                '151': 'fas fa-cloud-moon', // 多云（夜）
                '152': 'fas fa-cloud-moon', // 少云（夜）
                '153': 'fas fa-cloud', // 晴间多云（夜）
                '300': 'fas fa-cloud-rain', // 阵雨
                '301': 'fas fa-cloud-rain', // 强阵雨
                '302': 'fas fa-bolt', // 雷阵雨
                '303': 'fas fa-bolt', // 强雷阵雨
                '304': 'fas fa-cloud-showers-heavy', // 雷阵雨伴有冰雹
                '305': 'fas fa-cloud-rain', // 小雨
                '306': 'fas fa-cloud-rain', // 中雨
                '307': 'fas fa-cloud-showers-heavy', // 大雨
                '308': 'fas fa-cloud-showers-heavy', // 极端降雨
                '309': 'fas fa-cloud-rain', // 毛毛雨
                '310': 'fas fa-cloud-rain', // 暴雨
                '311': 'fas fa-cloud-showers-heavy', // 大暴雨
                '312': 'fas fa-cloud-showers-heavy', // 特大暴雨
                '313': 'fas fa-cloud-rain', // 冻雨
                '314': 'fas fa-cloud-rain', // 小到中雨
                '315': 'fas fa-cloud-rain', // 中到大雨
                '316': 'fas fa-cloud-showers-heavy', // 大到暴雨
                '317': 'fas fa-cloud-showers-heavy', // 暴雨到大暴雨
                '318': 'fas fa-cloud-showers-heavy', // 大暴雨到特大暴雨
                '399': 'fas fa-cloud-rain', // 雨
                '400': 'fas fa-snowflake', // 小雪
                '401': 'fas fa-snowflake', // 中雪
                '402': 'fas fa-snowflake', // 大雪
                '403': 'fas fa-snowflake', // 暴雪
                '404': 'fas fa-cloud-rain', // 雨夹雪
                '405': 'fas fa-cloud-rain', // 雨雪天气
                '406': 'fas fa-cloud-rain', // 阵雨夹雪
                '407': 'fas fa-snowflake', // 阵雪
                '408': 'fas fa-snowflake', // 小到中雪
                '409': 'fas fa-snowflake', // 中到大雪
                '410': 'fas fa-snowflake', // 大到暴雪
                '499': 'fas fa-snowflake', // 雪
                '500': 'fas fa-smog', // 薄雾
                '501': 'fas fa-smog', // 雾
                '502': 'fas fa-smog', // 霾
                '503': 'fas fa-wind', // 扬沙
                '504': 'fas fa-wind', // 浮尘
                '507': 'fas fa-wind', // 沙尘暴
                '508': 'fas fa-wind', // 强沙尘暴
                '509': 'fas fa-smog', // 浓雾
                '510': 'fas fa-smog', // 强浓雾
                '511': 'fas fa-smog', // 中度霾
                '512': 'fas fa-smog', // 重度霾
                '513': 'fas fa-smog', // 严重霾
                '514': 'fas fa-smog', // 大雾
                '515': 'fas fa-smog', // 特强浓雾
                '900': 'fas fa-temperature-high', // 热
                '901': 'fas fa-temperature-low', // 冷
                '999': 'fas fa-cloud' // 未知
            };
            return iconMap[code] || 'fas fa-cloud';
        },

        // 新增：通过IP定位获取位置信息
        async getLocationByIP() {
            try {
                console.log('开始IP定位...');
                // 使用高德地图IP定位API
                const response = await fetch(`https://restapi.amap.com/v3/ip?key=${weatherConfig.amapKey}`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log('高德IP定位返回:', data);

                if (data.status === '1' && data.province && data.city) {
                    // 高德IP定位返回省份和城市
                    const province = data.province;
                    const city = data.city;
                    const rectangle = data.rectangle; // 格式："左下角经度,左下角纬度;右上角经度,右上角纬度"

                    // 计算矩形中心点作为坐标
                    let longitude, latitude;
                    if (rectangle) {
                        const coords = rectangle.split(';');
                        const bottomLeft = coords[0].split(',').map(Number);
                        const topRight = coords[1].split(',').map(Number);
                        longitude = ((bottomLeft[0] + topRight[0]) / 2).toFixed(6);
                        latitude = ((bottomLeft[1] + topRight[1]) / 2).toFixed(6);
                    } else {
                        // 如果没有矩形区域，使用默认坐标
                        longitude = "116.397428";
                        latitude = "39.90923";
                    }

                    const locationName = city === province ? city : `${city}, ${province}`;

                    return {
                        location: `${longitude},${latitude}`,
                        locationName: locationName,
                        source: 'ip'
                    };
                } else {
                    throw new Error('高德IP定位未返回有效数据');
                }
            } catch (error) {
                console.warn('高德IP定位失败:', error);
                // 如果高德IP定位失败，尝试使用其他IP定位服务作为备选
                return await this.getLocationByIPFallback();
            }
        },

        // 新增：备用的IP定位服务
        async getLocationByIPFallback() {
            try {
                console.log('尝试备用IP定位...');
                const ipServices = [
                    'https://ipapi.co/json/',
                    'https://api.ip.sb/geoip'
                ];

                for (const serviceUrl of ipServices) {
                    try {
                        const response = await fetch(serviceUrl);

                        if (!response.ok) {
                            continue;
                        }

                        const data = await response.json();
                        console.log('备用IP定位服务返回:', data);

                        let latitude, longitude, cityName;

                        if (serviceUrl.includes('ipapi.co')) {
                            latitude = data.latitude;
                            longitude = data.longitude;
                            cityName = data.city;
                        } else if (serviceUrl.includes('ip.sb')) {
                            latitude = data.latitude;
                            longitude = data.longitude;
                            cityName = data.city;
                        }

                        if (latitude && longitude) {
                            // 使用高德逆地理编码获取城市名称
                            const chineseName = await this.reverseGeocodeAMap(longitude, latitude);
                            return {
                                location: `${longitude.toFixed(6)},${latitude.toFixed(6)}`,
                                locationName: chineseName,
                                source: 'ip_fallback'
                            };
                        }
                    } catch (error) {
                        console.warn(`备用IP定位服务 ${serviceUrl} 失败:`, error);
                        continue;
                    }
                }

                throw new Error('所有IP定位服务都失败了');
            } catch (error) {
                console.warn('备用IP定位失败:', error);
                throw error;
            }
        },

        // 新增：通过浏览器定位获取位置信息
        async getLocationByBrowser() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('浏览器不支持定位功能'));
                    return;
                }

                console.log('请求浏览器定位权限...');

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        console.log('浏览器定位成功:', position);
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        try {
                            // 使用高德逆地理编码获取详细位置信息
                            const locationName = await this.reverseGeocodeAMap(longitude, latitude);
                            resolve({
                                location: `${longitude.toFixed(6)},${latitude.toFixed(6)}`,
                                locationName: locationName,
                                source: 'browser'
                            });
                        } catch (error) {
                            console.warn('高德逆地理编码失败:', error);
                            // 即使逆地理编码失败，也返回坐标信息
                            resolve({
                                location: `${longitude.toFixed(6)},${latitude.toFixed(6)}`,
                                locationName: await this.getCityNameFromCoords(longitude, latitude),
                                source: 'browser'
                            });
                        }
                    },
                    (error) => {
                        console.error('浏览器定位失败:', error);
                        let errorMessage = '浏览器定位失败';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = '定位权限被拒绝，请允许浏览器定位权限';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = '无法获取位置信息';
                                break;
                            case error.TIMEOUT:
                                errorMessage = '定位请求超时';
                                break;
                        }
                        reject(new Error(errorMessage));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5分钟缓存
                    }
                );
            });
        },

        // 新增：使用高德地图逆地理编码API获取城市名称
        async reverseGeocodeAMap(longitude, latitude) {
            try {
                console.log('开始高德逆地理编码:', longitude, latitude);
                const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${weatherConfig.amapKey}&location=${longitude},${latitude}&extensions=base`);

                if (!response.ok) {
                    throw new Error(`高德逆地理编码请求失败: HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log('高德逆地理编码返回:', data);

                if (data.status === '1' && data.regeocode) {
                    const addressComponent = data.regeocode.addressComponent;
                    // 关键修复：先强制转为字符串，再处理空值（避免非字符串类型）
                    const province = String(addressComponent.province || '');
                    const city = String(addressComponent.city || '');
                    const district = String(addressComponent.district || '');

                    // 构建位置名称
                    let locationName;
                    // 直辖市判断：去除"市"后缀后对比（此时已确保是字符串，可安全调用replace）
                    const provinceClean = province.replace('市', '');
                    const cityClean = city.replace('市', '');
                    const isMunicipality = provinceClean && cityClean && provinceClean === cityClean;

                    if (isMunicipality) {
                        // 直辖市：返回简洁名称
                        locationName = provinceClean;
                    } else if (cityClean) {
                        // 普通城市：城市 + 省份（去重后缀）
                        locationName = `${cityClean}, ${provinceClean}`;
                    } else {
                        // 仅能获取省份
                        locationName = provinceClean;
                    }

                    // 最终兜底：避免空字符串
                    locationName = locationName || '未知位置';

                    console.log('高德逆地理编码成功，位置名称:', locationName);
                    return locationName;
                } else {
                    throw new Error('高德逆地理编码未返回有效数据');
                }
            } catch (error) {
                console.warn('高德逆地理编码失败:', error);
                throw error;
            }
        },

        // 新增：从坐标生成简单的城市名称（备用方法）
        async getCityNameFromCoords(longitude, latitude) {
            try {
                // 使用高德逆地理编码作为主要方法
                const locationName = await this.reverseGeocodeAMap(longitude, latitude);
                return locationName;
            } catch (e) {
                // 如果高德API失败，返回坐标信息
                return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            }
        },

        // 新增：自动定位功能
        async autoLocate() {
            try {
                // 首先尝试浏览器精确定位
                console.log('尝试浏览器定位...');
                const browserLocation = await this.getLocationByBrowser();
                console.log('浏览器定位成功:', browserLocation);
                return browserLocation;
            } catch (browserError) {
                console.warn('浏览器定位失败，尝试IP定位:', browserError);

                try {
                    // 浏览器定位失败后尝试IP定位
                    const ipLocation = await this.getLocationByIP();
                    console.log('IP定位成功:', ipLocation);
                    return ipLocation;
                } catch (ipError) {
                    console.error('所有定位方式都失败了:', ipError);
                    throw new Error('自动定位失败：请检查定位权限或手动设置位置');
                }
            }
        },

        // 新增：AI建议API调用
        async getAIAdvice(weatherData) {
            try {
                console.log('开始获取AI建议...');

                // 构建用户信息和天气数据的提示词
                const prompt = this.buildAIPrompt(weatherData);

                const response = await fetch(`${weatherConfig.openaiBaseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${weatherConfig.openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: weatherConfig.openaiModel,
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    })
                });

                if (!response.ok) {
                    throw new Error(`AI API请求失败: HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const adviceText = data.choices[0].message.content;
                    return this.parseAIResponse(adviceText);
                } else {
                    throw new Error('AI API返回数据格式错误');
                }
            } catch (error) {
                console.error('获取AI建议失败:', error);
                // 返回默认建议作为降级方案
                return this.getDefaultAdvice(weatherData);
            }
        },

        // 新增：构建AI提示词 - 使用配置中的用户信息
        buildAIPrompt(weatherData) {
            const userInfo = `个人信息：
- 年龄：${weatherConfig.userProfile.age}岁
- 性别：${weatherConfig.userProfile.gender}
- 通勤需求：${weatherConfig.userProfile.commuteDays}需要通勤
- 通勤方式：${weatherConfig.userProfile.commuteMethod}

核心需求：${weatherConfig.userProfile.coreNeeds}`;

            const weatherInfo = `当前天气数据：
- 位置：${weatherData.location}
- 当前温度：${weatherData.temperature}°C
- 天气状况：${weatherData.weather}
- 体感温度：${weatherData.feelsLike}°C
- 湿度：${weatherData.humidity}%
- 风速：${weatherData.windSpeed} km/h，风向：${weatherData.windDirection}
- 今日温度范围：${weatherData.todayLow}°C ~ ${weatherData.todayHigh}°C
- 日出时间：${weatherData.sunriseTime || '未知'}
- 日落时间：${weatherData.sunsetTime || '未知'}

未来24小时趋势：${weatherData.hourlyForecast.slice(0, 8).map(h => `${h.time} ${h.temperature}°C ${h.weather}`).join('; ')}

未来7天预报：${weatherData.dailyForecast.slice(0, 3).map(d => `${d.weekday} ${d.lowTemp}~${d.highTemp}°C ${d.weather}`).join('; ')}`;

            return `你是一个专业的天气生活助手，请根据以下信息为一位${weatherConfig.userProfile.age}岁${weatherConfig.userProfile.gender}提供个性化天气建议。

${userInfo}

${weatherInfo}

请针对以下5个方面提供具体、实用的建议，要求：
1. 个性化定制：结合用户年龄、性别、通勤方式
2. 数据融合：综合温度、湿度、风速、降水等多种要素
3. 趋势提醒：结合短期预报给出动态建议
4. 情景化：具体到出行、着装、健康等实际场景
5. 简洁实用：每个建议控制在40字以内

请严格按照以下格式返回，不要添加其他内容：

出行准备建议：[具体建议]
着装建议：[具体建议]
健康防护建议：[具体建议]
户外活动可行性建议：[具体建议]
通勤/交通提醒：[具体建议]`;
        },

        // 新增：解析AI响应
        parseAIResponse(responseText) {
            const adviceTypes = [
                '出行准备建议',
                '着装建议',
                '健康防护建议',
                '户外活动可行性建议',
                '通勤/交通提醒'
            ];

            const advice = {};

            adviceTypes.forEach(type => {
                const regex = new RegExp(`${type}：([^\\n]+)`);
                const match = responseText.match(regex);
                advice[type] = match ? match[1].trim() : this.getDefaultAdviceForType(type);
            });

            return advice;
        },

        // 新增：获取默认建议（降级方案）
        getDefaultAdvice(weatherData) {
            const temp = parseInt(weatherData.temperature);
            const weather = weatherData.weather;
            const humidity = parseInt(weatherData.humidity);

            return {
                '出行准备建议': this.getTravelAdvice(temp, weather, humidity),
                '着装建议': this.getDressingAdvice(temp, weather),
                '健康防护建议': this.getHealthAdvice(temp, weather, humidity),
                '户外活动可行性建议': this.getOutdoorAdvice(temp, weather),
                '通勤/交通提醒': this.getCommuteAdvice(temp, weather)
            };
        },

        // 新增：根据温度天气生成出行建议
        getTravelAdvice(temp, weather, humidity) {
            if (weather.includes('雨')) {
                return '今天有雨，建议携带雨具，选择防水背包和鞋子';
            } else if (temp > 30) {
                return '天气炎热，建议避开正午高温时段出行，携带防晒用品';
            } else if (temp < 5) {
                return '天气寒冷，外出注意保暖，建议使用保温杯携带热水';
            } else {
                return '天气适宜，正常出行即可，建议携带轻便外套备用';
            }
        },

        // 新增：着装建议
        getDressingAdvice(temp, weather) {
            if (temp > 28) {
                return '建议穿短袖、短裤等夏季服装，选择透气吸汗面料';
            } else if (temp > 20) {
                return '建议穿长袖T恤、薄外套，搭配长裤，舒适透气';
            } else if (temp > 10) {
                return '建议穿夹克、卫衣等秋季服装，注意早晚温差';
            } else {
                return '建议穿羽绒服、厚外套，戴围巾手套，注意防寒保暖';
            }
        },

        // 新增：健康防护建议
        getHealthAdvice(temp, weather, humidity) {
            const advice = [];

            if (humidity > 80) {
                advice.push('湿度较高，注意防潮除湿，保持室内通风');
            } else if (humidity < 30) {
                advice.push('空气干燥，注意补水保湿，可使用加湿器');
            }

            if (temp > 30) {
                advice.push('注意防暑降温，及时补充水分和电解质');
            } else if (temp < 5) {
                advice.push('注意防寒保暖，预防感冒和呼吸道疾病');
            }

            if (weather.includes('霾') || weather.includes('沙尘')) {
                advice.push('空气质量较差，建议佩戴防护口罩，减少户外活动');
            }

            return advice.length > 0 ? advice.join('；') : '天气条件良好，保持正常生活习惯即可';
        },

        // 新增：户外活动建议
        getOutdoorAdvice(temp, weather) {
            if (weather.includes('雨') || weather.includes('雪')) {
                return '不适宜户外活动，建议选择室内运动或改期进行';
            } else if (weather.includes('雷')) {
                return '有雷电活动，严禁户外活动，务必待在室内';
            } else if (temp > 35 || temp < -10) {
                return '温度极端，不适宜长时间户外活动，注意安全';
            } else if (temp > 25 && temp < 30) {
                return '天气适宜户外活动，建议在早晚凉爽时段进行';
            } else {
                return '条件允许户外活动，注意适时休息和补充水分';
            }
        },

        // 新增：通勤建议
        getCommuteAdvice(temp, weather) {
            const advice = [];

            if (weather.includes('雨') || weather.includes('雪')) {
                advice.push('雨天路滑，骑行请注意安全，建议选择公共交通');
                advice.push('预留额外通勤时间，注意车辆行驶安全');
            } else if (weather.includes('雾') || weather.includes('霾')) {
                advice.push('能见度较低，骑行请开启车灯，减速慢行');
            } else if (temp < 0) {
                advice.push('路面可能结冰，骑行需特别小心，建议选择地铁');
            } else {
                advice.push('通勤条件良好，共享电单车+地铁是理想选择');
            }

            return advice.join('；');
        },

        // 新增：获取默认类型建议
        getDefaultAdviceForType(type) {
            const defaults = {
                '出行准备建议': '根据天气情况准备相应物品，注意温度变化',
                '着装建议': '根据温度选择合适的服装，注意舒适度',
                '健康防护建议': '关注天气变化，做好相应健康防护',
                '户外活动可行性建议': '根据天气条件评估户外活动适宜度',
                '通勤/交通提醒': '合理安排通勤方式，注意交通安全'
            };
            return defaults[type] || '建议信息暂不可用';
        }
    };

    // 天气数据管理 - 保持原有代码100%不变，只新增日出日落数据
    const weatherData = {
        current: null,
        currentLocation: utils.loadSettings(),

        async fetchWeatherData() {
            const location = this.currentLocation.location;

            try {
                // 并行获取所有天气数据
                const [nowData, hourlyData, dailyData] = await Promise.all([
                    this.fetchApiData('/weather/now', location),
                    this.fetchApiData('/weather/24h', location),
                    this.fetchApiData('/weather/7d', location)
                ]);

                // 保存当前设置
                utils.saveSettings(location, this.currentLocation.locationName);

                return this.formatWeatherData(nowData, hourlyData, dailyData);
            } catch (error) {
                console.error('天气API请求失败:', error);
                throw error;
            }
        },

        async fetchApiData(endpoint, location) {
            const url = `https://${weatherConfig.apiHost}/v7${endpoint}?location=${location}`;

            const response = await fetch(url, {
                headers: {
                    'X-QW-Api-Key': weatherConfig.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.code === '200') {
                return data;
            } else {
                throw new Error(data.code || 'API返回错误');
            }
        },

        formatWeatherData(nowData, hourlyData, dailyData) {
            const now = nowData.now;
            const today = dailyData.daily[0];

            return {
                location: this.currentLocation.locationName,
                temperature: now.temp || '--',
                weather: now.text || '未知',
                description: now.text || '未知天气',
                humidity: now.humidity || '--',
                windSpeed: now.windSpeed || '--',
                windDirection: now.windDir || '--',
                feelsLike: now.feelsLike || '--',
                windScale: now.windScale || '--',
                icon: utils.getWeatherIcon(now.icon),
                updateTime: this.formatUpdateTime(),
                todayHigh: dailyData.daily[0].tempMax || '--',
                todayLow: dailyData.daily[0].tempMin || '--',
                // 新增：日出日落时间
                sunriseTime: today.sunrise || '--',
                sunsetTime: today.sunset || '--',
                hourlyForecast: this.formatHourlyData(hourlyData.hourly || []),
                dailyForecast: this.formatDailyData(dailyData.daily || []),
                rawData: { nowData, hourlyData, dailyData }
            };
        },

        formatHourlyData(hourlyData) {
            if (!hourlyData || !Array.isArray(hourlyData)) {
                return this.generateMockHourlyData();
            }

            console.log('和风天气API返回的小时数据点数量:', hourlyData.length);

            // 使用和风天气返回的24小时数据，确保每个小时一个数据点
            return hourlyData.slice(0, 24).map((hour, index) => ({
                time: utils.formatTime(hour.fxTime),
                temperature: parseInt(hour.temp),
                weather: hour.text,
                icon: utils.getWeatherIcon(hour.icon),
                precipitation: hour.precip || '0mm'
            }));
        },

        formatDailyData(dailyData) {
            const days = [];
            const today = new Date();

            dailyData.slice(0, 7).forEach((day, index) => {
                const date = new Date(today);
                date.setDate(today.getDate() + index);

                days.push({
                    weekday: index === 0 ? '今天' : utils.getWeekday(day.fxDate),
                    highTemp: day.tempMax,
                    lowTemp: day.tempMin,
                    weather: day.textDay,
                    weatherText: day.textDay,
                    icon: utils.getWeatherIcon(day.iconDay)
                });
            });

            return days;
        },

        generateMockHourlyData() {
            const hours = [];
            const now = new Date();
            const currentHour = now.getHours();

            // 生成24小时模拟数据 - 每个小时一个点
            let baseTemp = 20;
            for (let i = 0; i < 24; i++) {
                const hour = (currentHour + i) % 24;
                // 模拟温度变化：白天高，夜晚低
                const variation = Math.sin((i / 24) * Math.PI * 2) * 8;
                const temperature = Math.round(baseTemp + variation);

                // 模拟天气变化
                let weather = '晴';
                let iconCode = '100';
                if (hour >= 18 || hour <= 6) {
                    weather = '晴';
                    iconCode = '150'; // 夜间晴
                } else if (hour >= 12 && hour <= 15) {
                    weather = '多云';
                    iconCode = '101';
                } else if (hour >= 8 && hour <= 11) {
                    weather = '晴';
                    iconCode = '100';
                }

                hours.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    temperature: temperature,
                    weather: weather,
                    icon: utils.getWeatherIcon(iconCode),
                    precipitation: '0mm'
                });
            }

            return hours;
        },

        formatUpdateTime() {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        },

        // 模拟数据作为备用
        getMockData() {
            return {
                location: this.currentLocation.locationName,
                temperature: 15 + Math.floor(Math.random() * 15),
                weather: '晴',
                description: '晴朗',
                humidity: 40 + Math.floor(Math.random() * 40),
                windSpeed: (2 + Math.random() * 5).toFixed(1),
                windDirection: '东南风',
                feelsLike: 13 + Math.floor(Math.random() * 15),
                windScale: '2-3级',
                icon: utils.getWeatherIcon('100'),
                updateTime: '刚刚',
                todayHigh: 25,
                todayLow: 15,
                sunriseTime: '06:30',
                sunsetTime: '18:45',
                hourlyForecast: this.generateMockHourlyData(),
                dailyForecast: this.generateMockDailyData(),
                isMock: true
            };
        },

        generateMockDailyData() {
            const days = [];
            const today = new Date();
            const conditions = ['100', '101', '104', '305']; // 晴, 多云, 阴, 小雨

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const condition = conditions[Math.floor(Math.random() * conditions.length)];

                days.push({
                    weekday: i === 0 ? '今天' : utils.getWeekday(date),
                    highTemp: 20 + Math.floor(Math.random() * 10),
                    lowTemp: 10 + Math.floor(Math.random() * 8),
                    weather: this.getWeatherText(condition),
                    weatherText: this.getWeatherText(condition),
                    icon: utils.getWeatherIcon(condition)
                });
            }

            return days;
        },

        getWeatherText(iconCode) {
            const textMap = {
                '100': '晴',
                '101': '多云',
                '104': '阴',
                '305': '小雨'
            };
            return textMap[iconCode] || '晴';
        }
    };

    // UI管理 - 新增日出日落显示和AI建议面板
    const weatherUI = {
        init() {
            this.createContainer();
            this.addStyles();
            this.bindGlobalEvents();
        },

        createContainer() {
            if (document.getElementById('qweather-widget')) return;

            const container = document.createElement('div');
            container.id = 'qweather-widget';
            container.innerHTML = `
                <!-- 移动端和PC端按钮 -->
                <div class="weather-toggle-btn ${utils.isMobile() ? 'weather-mobile-btn' : 'weather-pc-btn'}">
                    <i class="fas fa-cloud-sun"></i>
                </div>
                
                <!-- 天气面板 -->
                <div class="weather-panel ${utils.isMobile() ? 'weather-panel-mobile' : 'weather-panel-pc'} hidden">
                    <div class="weather-panel-content-wrapper">
                        <div class="weather-header">
                            <div class="location" title="点击切换城市">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="city-name">加载中...</span>
                            </div>
                            <div class="weather-actions">
                                <button class="weather-auto-locate-btn" title="自动定位">
                                    <i class="fas fa-crosshairs"></i>
                                </button>
                                <button class="weather-refresh-btn" title="刷新天气">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                                <button class="weather-close-btn" title="关闭面板">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="weather-main">
                            <div class="temperature-container">
                                <div class="temperature">--°</div>
                                <div class="temp-range">
                                    <span class="high-temp">--°</span>
                                    <span class="low-temp">--°</span>
                                </div>
                            </div>
                            <div class="weather-icon">
                                <i class="fas fa-sun"></i>
                            </div>
                        </div>
                        
                        <div class="weather-description">加载中...</div>
                        
                        <!-- 简化的小信息栏 -->
                        <div class="weather-mini-info">
                            <div class="mini-item">
                                <i class="fas fa-wind"></i>
                                <span class="mini-value" id="wind-speed">--</span>
                                <span class="mini-label">风速</span>
                            </div>
                            <div class="mini-item">
                                <i class="fas fa-tint"></i>
                                <span class="mini-value" id="humidity">--</span>
                                <span class="mini-label">湿度</span>
                            </div>
                            <div class="mini-item">
                                <i class="fas fa-temperature-low"></i>
                                <span class="mini-value" id="feels-like">--</span>
                                <span class="mini-label">体感</span>
                            </div>
                        </div>
                        
                        <!-- 24小时天气预报 - 带折线图 -->
                        <div class="hourly-forecast">
                            <div class="hourly-header">
                                <div class="section-title">24小时预报</div>
                                <div class="sun-times">
                                    <span class="sunrise">
                                        <i class="fas fa-sun"></i>
                                        <span class="sun-time-text">日出 --:--</span>
                                    </span>
                                    <span class="sunset">
                                        <i class="fas fa-moon"></i>
                                        <span class="sun-time-text">日落 --:--</span>
                                    </span>
                                </div>
                            </div>
                            <div class="hourly-scroll-container">
                                <div class="hourly-chart-container">
                                    <svg class="temperature-line-chart" width="1200" height="120">
                                        <!-- 折线图路径将由JS动态生成 -->
                                    </svg>
                                    <div class="hourly-list">
                                        <!-- 小时数据将由JS动态生成 -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 7天天气预报 -->
                        <div class="daily-forecast">
                            <div class="section-title">7天预报</div>
                            <div class="daily-list">
                                <!-- 每日数据将由JS动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 新增：AI建议面板 -->
                        <div class="ai-advice-panel">
                            <div class="section-title">
                                <i class="fas fa-robot"></i>
                                AI生活建议
                                <span class="ai-loading hidden">分析中...</span>
                            </div>
                            <div class="advice-grid">
                                <div class="advice-item">
                                    <div class="advice-icon">
                                        <i class="fas fa-walking"></i>
                                    </div>
                                    <div class="advice-content">
                                        <div class="advice-title">出行准备</div>
                                        <div class="advice-text">分析中...</div>
                                    </div>
                                </div>
                                <div class="advice-item">
                                    <div class="advice-icon">
                                        <i class="fas fa-tshirt"></i>
                                    </div>
                                    <div class="advice-content">
                                        <div class="advice-title">着装建议</div>
                                        <div class="advice-text">分析中...</div>
                                    </div>
                                </div>
                                <div class="advice-item">
                                    <div class="advice-icon">
                                        <i class="fas fa-heartbeat"></i>
                                    </div>
                                    <div class="advice-content">
                                        <div class="advice-title">健康防护</div>
                                        <div class="advice-text">分析中...</div>
                                    </div>
                                </div>
                                <div class="advice-item">
                                    <div class="advice-icon">
                                        <i class="fas fa-running"></i>
                                    </div>
                                    <div class="advice-content">
                                        <div class="advice-title">户外活动</div>
                                        <div class="advice-text">分析中...</div>
                                    </div>
                                </div>
                                <div class="advice-item">
                                    <div class="advice-icon">
                                        <i class="fas fa-subway"></i>
                                    </div>
                                    <div class="advice-content">
                                        <div class="advice-title">通勤提醒</div>
                                        <div class="advice-text">分析中...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="weather-footer">
                            <span class="update-time">更新于: 刚刚</span>
                            <span class="mock-indicator hidden">演示数据</span>
                        </div>
                    </div>
                </div>
                
                <!-- 移动端遮罩 -->
                <div class="weather-mobile-overlay hidden"></div>
                
                <!-- 城市选择弹窗 -->
                <div class="city-select-modal hidden">
                    <div class="modal-content">
                        <h3>选择位置</h3>
                        <div class="input-group">
                            <label for="location-name-input">位置名称:</label>
                            <input type="text" id="location-name-input" placeholder="例如: 北京" value="${weatherData.currentLocation.locationName}">
                        </div>
                        <div class="input-group">
                            <label for="location-coord-input">经纬度:</label>
                            <input type="text" id="location-coord-input" placeholder="例如: 116.41,39.92" value="${weatherData.currentLocation.location}">
                        </div>
                        <div class="modal-tips">
                            <p><strong>提示:</strong> 使用经纬度坐标获取精确天气数据</p>
                            <p>格式: 经度,纬度 (例如: 116.41,39.92)</p>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-auto-locate">自动定位</button>
                            <button class="modal-cancel">取消</button>
                            <button class="modal-confirm">确认</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
            this.bindEvents();
        },

        addStyles() {
            const styles = `
                <style>
                #qweather-widget {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    z-index: 10000;
                }
                
                /* 移动端和PC端按钮 - 调整到导航按钮右侧 */
                .weather-toggle-btn {
                    position: fixed;
                    top: 20px !important;
                    left: 76px !important;
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    z-index: 10001;
                    transition: all 0.3s ease;
                }
                
                .weather-toggle-btn:hover {
                    transform: scale(1.05);
                    background: rgba(255, 255, 255, 0.25);
                }
                
                .weather-toggle-btn i {
                    font-size: 1.4rem;
                    color: ${weatherConfig.textColor};
                    opacity: 0.9;
                }
                
                /* 天气面板 - PC端 */
                .weather-panel-pc {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    width: 350px;
                    background: rgba(255, 255, 255, ${weatherConfig.transparency});
                    backdrop-filter: blur(15px);
                    border-radius: 16px;
                    padding: 20px 6px 20px 20px; /* 右侧减少padding给滚动条腾位置 */
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: ${weatherConfig.textColor};
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    z-index: 10002;
                    overflow: hidden; /* 确保圆角裁剪生效 */
                    transform-origin: 56px 0;
                    transform: scale(0);
                    opacity: 0;
                    transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    pointer-events: none;
                }

                .weather-panel-content-wrapper {
                    flex: 1; /* 占据剩余空间 */
                    min-height: 0; /* 允许flex子项小于内容高度 */
                    overflow-y: auto;
                    padding-right: 14px; /* 补回右侧padding */
                    /* 自定义滚动条样式 */
                    scrollbar-width: thin;
                    scrollbar-color: ${weatherConfig.textColor} transparent;
                }

                .weather-panel-content-wrapper::-webkit-scrollbar {
                    width: 4px;
                }

                .weather-panel-content-wrapper::-webkit-scrollbar-track {
                    background: transparent;
                }

                .weather-panel-content-wrapper::-webkit-scrollbar-thumb {
                    background: ${weatherConfig.textColor};
                    border-radius: 2px;
                    opacity: 0.3;
                }

                .weather-panel-content-wrapper::-webkit-scrollbar-thumb:hover {
                    background: ${weatherConfig.textColor};
                    opacity: 0.5;
                }
                
                /* PC端面板激活状态 - 展开 */
                .weather-panel-pc.weather-panel-active {
                    transform: scale(1);
                    opacity: 1;
                    pointer-events: auto;
                }
                
                /* 天气面板 - 移动端 */
                .weather-panel-mobile {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90%;
                    max-width: 350px;
                    max-height: 80vh;
                    background: rgba(255, 255, 255, ${weatherConfig.transparency});
                    backdrop-filter: blur(15px);
                    border-radius: 16px;
                    padding: 20px 6px 20px 20px; /* 保持与PC端一致的内边距逻辑 */
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: ${weatherConfig.textColor};
                    display: flex;
                    flex-direction: column;
                    overflow: hidden; /* 确保圆角裁剪 */
                    z-index: 10003;
                    display: none;
                }
                
                .weather-panel-mobile-active {
                    display: block !important;
                }
                
                /* 移动端遮罩 */
                .weather-mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 10002;
                    display: none;
                    transition: opacity 0.3s ease;
                }
                
                .weather-mobile-overlay-active {
                    display: block !important;
                }
                
                /* 24小时天气预报头部 - 新增日出日落 */
                .hourly-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .sun-times {
                    display: flex;
                    gap: 12px;
                    font-size: 0.75rem;
                    opacity: 0.8;
                }
                
                .sunrise, .sunset {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .sunrise i {
                    color: #ffb74d;
                }
                
                .sunset i {
                    color: #ff9800;
                }
                
                .sun-time-text {
                    font-size: 0.7rem;
                }
                
                /* 24小时天气预报 - 带折线图 - 完全复刻原有样式 */
                .hourly-forecast {
                    margin-bottom: 15px;
                }
                
                .hourly-scroll-container {
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                
                .hourly-chart-container {
                    position: relative;
                    min-width: 1200px; /* 增加宽度以适应24个数据点 */
                    height: 180px;
                }
                
                .temperature-line-chart {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 1200px; /* 增加宽度以适应24个数据点 */
                    height: 140px;
                }
                
                .temperature-line {
                    fill: none;
                    stroke: ${weatherConfig.textColor};
                    stroke-opacity: 0.8;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                
                .temperature-point {
                    fill: ${weatherConfig.textColor};
                    fill-opacity: 0.9;
                    stroke: ${weatherConfig.textColor};
                    stroke-opacity: 0.3;
                    stroke-width: 1;
                    r: 4;
                    transition: all 0.3s ease;
                }
                
                .temperature-point:hover {
                    r: 6;
                    fill: ${weatherConfig.textColor};
                }
                
                .hourly-list {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    display: flex;
                    width: 1200px; /* 增加宽度以适应24个数据点 */
                    justify-content: space-between; /* 均匀分布24个点 */
                }
                
                .hourly-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    width: 50px; /* 保持原有宽度 */
                    position: relative;
                }
                
                .hourly-time {
                    font-size: 0.7rem;
                    opacity: 0.8;
                    white-space: nowrap;
                }
                
                .hourly-icon {
                    font-size: 1rem;
                    opacity: 0.9;
                }
                
                .hourly-temp {
                    font-size: 0.8rem;
                    font-weight: 600;
                    white-space: nowrap;
                }
                
                /* 7天天气预报 */
                .daily-forecast {
                    margin-bottom: 15px;
                }
                
                .daily-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .daily-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                    position: relative;
                }

                .daily-item::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: ${weatherConfig.textColor};
                    opacity: 0.1;
                }

                
                .daily-weekday {
                    min-width: 35px;
                    font-size: 0.85rem;
                    opacity: 0.9;
                }
                
                .daily-weather {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 80px;
                    justify-content: center;
                }
                
                .daily-weather-text {
                    font-size: 0.8rem;
                    opacity: 0.9;
                }
                
                .daily-icon {
                    font-size: 1rem;
                    opacity: 0.9;
                    min-width: 20px;
                    text-align: center;
                }
                
                .daily-temp {
                    display: flex;
                    gap: 12px;
                    font-size: 0.85rem;
                    min-width: 60px;
                    justify-content: flex-end;
                }
                
                .daily-high {
                    font-weight: 600;
                }
                
                .daily-low {
                    opacity: 0.7;
                }
                
                /* 新增：AI建议面板样式 */
                .ai-advice-panel {
                    margin-bottom: 10px;
                }
                
                .ai-advice-panel .section-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 10px;
                }
                
                .ai-advice-panel .section-title i {
                    color: ${weatherConfig.textColor};
                }
                
                .ai-loading {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-left: auto;
                }
                
                .advice-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                
                .advice-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                
                .advice-item:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-1px);
                }
                
                .advice-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(79, 195, 247, 0.2);
                    border-radius: 6px;
                    flex-shrink: 0;
                }
                
                .advice-icon i {
                    color: #4fc3f7;
                    font-size: 0.9rem;
                }
                
                .advice-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .advice-title {
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: ${weatherConfig.textColor};
                    opacity: 0.9;
                }
                
                .advice-text {
                    font-size: 0.75rem;
                    line-height: 1.3;
                    opacity: 0.8;
                    word-wrap: break-word;
                }
                
                /* 其他样式保持不变... */
                .weather-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .location {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    max-width: 70%;
                }
                
                .location:hover {
                    opacity: 0.8;
                    transform: translateX(2px);
                }
                
                .location i {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                
                .weather-actions {
                    display: flex;
                    gap: 4px;
                }
                
                .weather-auto-locate-btn,
                .weather-refresh-btn,
                .weather-close-btn {
                    background: none;
                    border: none;
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: ${weatherConfig.textColor};
                    opacity: 0.8;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .weather-auto-locate-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #4fc3f7;
                }
                
                .weather-refresh-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: ${weatherConfig.textColor};
                    opacity: 1;
                }
                
                .weather-close-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: ${weatherConfig.textColor};
                    opacity: 1;
                }
                
                .weather-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .temperature-container {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .temperature {
                    font-size: 2.8rem;
                    font-weight: 300;
                    line-height: 1;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .temp-range {
                    display: flex;
                    gap: 8px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .high-temp::after {
                    content: "/";
                    margin-left: 4px;
                }
                
                .weather-icon {
                    font-size: 3.2rem;
                    opacity: 0.9;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .weather-description {
                    text-align: center;
                    font-size: 1rem;
                    margin-bottom: 15px;
                    opacity: 0.9;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }
                
                /* 简化的小信息栏 */
                .weather-mini-info {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 15px;
                    padding: 10px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .mini-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }
                
                .mini-item i {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .mini-value {
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                
                .mini-label {
                    font-size: 0.7rem;
                    opacity: 0.7;
                }
                
                .section-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                    opacity: 0.9;
                }
                
                .weather-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.7rem;
                    opacity: 0.6;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .mock-indicator {
                    color: #ff6b6b;
                    font-weight: 500;
                }
                
                /* 滚动条样式 */
                .hourly-scroll-container::-webkit-scrollbar {
                    height: 4px;
                }
                
                .hourly-scroll-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
                
                .hourly-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                }
                
                .hourly-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
                
                /* 工具类 */
                .hidden {
                    display: none !important;
                }
                
                /* 加载动画 */
                .weather-loading .temperature,
                .weather-loading .weather-description,
                .weather-loading .mini-value,
                .weather-loading .temp-range span,
                .weather-loading .hourly-temp,
                .weather-loading .daily-temp span {
                    color: transparent;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                /* 响应式调整 */
                @media (max-width: 480px) {
                  .weather-panel-mobile {
                   width: 95%;
                   padding: 16px;
                   }
    
                 .temperature {
                  font-size: 2.5rem;
                 }
    
                 .weather-icon {
                 font-size: 2.8rem;
                 }
     
                  .hourly-header {
                   flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                 gap: 4px;
                 }
    
                  .sun-times {
                  display: flex;
                   gap: 12px;
                  font-size: 0.7rem;
                  align-self: auto;
                     }
                 }
                /* 城市选择弹窗 */
                .city-select-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 20000;
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                    color: #333;
                }

                .modal-content h3 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                    color: #333;
                    text-align: center;
                }

                .input-group {
                    margin-bottom: 15px;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: #666;
                }

                .input-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                    color: #333;
                    background: white;
                }

                .input-group input:focus {
                    border-color: #4fc3f7;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.2);
                }

                .modal-tips {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-size: 0.85rem;
                    color: #666;
                    line-height: 1.5;
                }

                .modal-tips p {
                    margin: 4px 0;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }

                .modal-actions button {
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .modal-auto-locate {
                    margin-right: auto;
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .modal-auto-locate:hover {
                    background: #bbdefb;
                }

                .modal-cancel {
                    background: #f5f5f5;
                    color: #666;
                }

                .modal-cancel:hover {
                    background: #e0e0e0;
                }

                .modal-confirm {
                    background: #4fc3f7;
                    color: white;
                }

                .modal-confirm:hover {
                    background: #29b6f6;
                }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        },

        updateHourlyForecast(hourlyData, sunriseTime, sunsetTime) {
            const hourlyList = document.querySelector('.hourly-list');
            const chartSvg = document.querySelector('.temperature-line-chart');

            // 清空现有内容
            hourlyList.innerHTML = '';
            chartSvg.innerHTML = '';

            console.log('更新24小时预报，数据点数量:', hourlyData.length);

            // 计算每个项目的宽度 - 完全复刻原有逻辑
            const dataPointCount = hourlyData.length;
            const containerWidth = 1200;
            const itemWidth = containerWidth / dataPointCount;

            // 设置SVG宽度
            chartSvg.setAttribute('width', containerWidth);

            // 生成折线图数据点 - 完全复刻原有逻辑
            const points = hourlyData.map((hour, index) => ({
                x: index,
                temp: hour.temperature
            }));

            // 生成折线路径 - 完全复刻原有逻辑
            const linePath = utils.generateTemperatureLine(points, containerWidth, 120, itemWidth);
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', linePath);
            pathElement.setAttribute('class', 'temperature-line');
            chartSvg.appendChild(pathElement);

            // 生成小时项目和温度点 - 完全复刻原有逻辑
            hourlyData.forEach((hour, index) => {
                // 计算x坐标 - 在每个项目的中心位置
                const x = (index * itemWidth) + (itemWidth / 2);

                // 计算y坐标 - 使用相同的计算方法确保对齐
                const allTemps = hourlyData.map(item => parseInt(item.temperature));
                const minTemp = Math.min(...allTemps);
                const maxTemp = Math.max(...allTemps);
                const range = maxTemp - minTemp;
                const heightPercent = range === 0 ? 50 : ((hour.temperature - minTemp) / range) * 60 + 30;
                const y = 140 - (heightPercent / 100) * 120;

                // 添加温度点
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('class', 'temperature-point');
                circle.setAttribute('data-temp', hour.temperature);
                circle.setAttribute('data-index', index);
                chartSvg.appendChild(circle);

                // 添加小时项目
                const hourlyItem = document.createElement('div');
                hourlyItem.className = 'hourly-item';
                hourlyItem.style.width = `${itemWidth}px`;
                hourlyItem.innerHTML = `
                    <div class="hourly-time">${hour.time}</div>
                    <i class="${hour.icon} hourly-icon"></i>
                    <div class="hourly-temp">${hour.temperature}°</div>
                `;
                hourlyList.appendChild(hourlyItem);
            });

            // 更新日出日落时间
            this.updateSunTimes(sunriseTime, sunsetTime);

            console.log('24小时折线图更新完成，数据点:', dataPointCount, '项目宽度:', itemWidth);
        },

        // 新增：更新日出日落时间
        updateSunTimes(sunriseTime, sunsetTime) {
            const sunriseElement = document.querySelector('.sunrise .sun-time-text');
            const sunsetElement = document.querySelector('.sunset .sun-time-text');

            if (sunriseElement && sunsetElement) {
                sunriseElement.textContent = `日出 ${sunriseTime}`;
                sunsetElement.textContent = `日落 ${sunsetTime}`;
            }
        },

        updateDailyForecast(dailyData) {
            const dailyList = document.querySelector('.daily-list');
            dailyList.innerHTML = '';

            dailyData.forEach(day => {
                const dailyItem = document.createElement('div');
                dailyItem.className = 'daily-item';
                dailyItem.innerHTML = `
                    <div class="daily-weekday">${day.weekday}</div>
                    <div class="daily-weather">
                        <span class="daily-weather-text">${day.weatherText}</span>
                        <i class="${day.icon} daily-icon"></i>
                    </div>
                    <div class="daily-temp">
                        <span class="daily-high">${day.highTemp}°</span>
                        <span class="daily-low">${day.lowTemp}°</span>
                    </div>
                `;
                dailyList.appendChild(dailyItem);
            });
        },

        // 新增：更新AI建议面板
        updateAIAdvice(adviceData) {
            const adviceItems = document.querySelectorAll('.advice-item');
            const aiLoading = document.querySelector('.ai-loading');

            if (aiLoading) {
                aiLoading.classList.add('hidden');
            }

            // 更新每个建议项
            adviceItems.forEach(item => {
                const titleElement = item.querySelector('.advice-title');
                const textElement = item.querySelector('.advice-text');

                if (titleElement && textElement) {
                    const title = titleElement.textContent;
                    let adviceText = '';

                    switch (title) {
                        case '出行准备':
                            adviceText = adviceData['出行准备建议'] || '建议信息暂不可用';
                            break;
                        case '着装建议':
                            adviceText = adviceData['着装建议'] || '建议信息暂不可用';
                            break;
                        case '健康防护':
                            adviceText = adviceData['健康防护建议'] || '建议信息暂不可用';
                            break;
                        case '户外活动':
                            adviceText = adviceData['户外活动可行性建议'] || '建议信息暂不可用';
                            break;
                        case '通勤提醒':
                            adviceText = adviceData['通勤/交通提醒'] || '建议信息暂不可用';
                            break;
                    }

                    textElement.textContent = adviceText;
                }
            });
        },

        // 新增：设置AI建议加载状态
        setAIAdviceLoading(loading) {
            const aiLoading = document.querySelector('.ai-loading');
            const adviceTexts = document.querySelectorAll('.advice-text');

            if (loading) {
                if (aiLoading) aiLoading.classList.remove('hidden');
                adviceTexts.forEach(text => {
                    text.textContent = '分析中...';
                });
            } else {
                if (aiLoading) aiLoading.classList.add('hidden');
            }
        },

        bindEvents() {
            const container = document.getElementById('qweather-widget');
            const toggleBtn = container.querySelector('.weather-toggle-btn');
            const panel = container.querySelector('.weather-panel');

            // 移动端：保持点击切换逻辑
            if (utils.isMobile()) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePanel();
                });
            } else {
                // PC端：使用悬停显示逻辑
                let hideTimeout;

                // 鼠标进入按钮时显示面板
                toggleBtn.addEventListener('mouseenter', () => {
                    clearTimeout(hideTimeout);
                    this.showPanel();
                });

                // 鼠标离开按钮时设置延迟隐藏
                toggleBtn.addEventListener('mouseleave', () => {
                    hideTimeout = setTimeout(() => {
                        this.hidePanel();
                    }, 600);
                });

                // 鼠标进入面板时取消隐藏
                panel.addEventListener('mouseenter', () => {
                    clearTimeout(hideTimeout);
                });

                // 鼠标离开面板时隐藏
                panel.addEventListener('mouseleave', () => {
                    hideTimeout = setTimeout(() => {
                        this.hidePanel();
                    }, 300);
                });
            }

            // 位置点击事件
            container.querySelector('.location').addEventListener('click', () => {
                this.showCitySelectModal();
            });

            // 自动定位按钮
            container.querySelector('.weather-auto-locate-btn').addEventListener('click', () => {
                this.autoLocate();
            });

            // 刷新按钮
            container.querySelector('.weather-refresh-btn').addEventListener('click', () => {
                weatherApp.refreshWeather();
            });

            // 关闭按钮
            container.querySelector('.weather-close-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.hidePanel();
            });

            // 移动端遮罩
            const overlay = container.querySelector('.weather-mobile-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hideMobilePanel();
                });
            }

            this.bindModalEvents();
        },

        bindModalEvents() {
            const container = document.getElementById('qweather-widget');
            const modal = container.querySelector('.city-select-modal');

            // 自动定位按钮
            container.querySelector('.modal-auto-locate').addEventListener('click', async () => {
                await this.autoLocate(true); // true表示在模态框中执行
            });

            // 确认按钮
            container.querySelector('.modal-confirm').addEventListener('click', () => {
                const locationName = container.querySelector('#location-name-input').value.trim();
                const location = container.querySelector('#location-coord-input').value.trim();

                if (locationName && location) {
                    weatherData.currentLocation = { location, locationName };
                    weatherApp.loadWeatherData();
                    this.hideCitySelectModal();
                } else {
                    alert('请输入完整的位置信息');
                }
            });

            // 取消按钮
            container.querySelector('.modal-cancel').addEventListener('click', () => {
                this.hideCitySelectModal();
            });

            // 输入框回车事件
            const inputs = container.querySelectorAll('#location-name-input, #location-coord-input');
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        container.querySelector('.modal-confirm').click();
                    }
                });
            });

            // 点击模态框外部关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideCitySelectModal();
                }
            });
        },

        bindGlobalEvents() {
            // 窗口大小变化
            window.addEventListener('resize', utils.debounce(() => {
                this.handleResize();
            }, 250));

            // ESC键关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hidePanel();
                }
            });
        },

        handleResize() {
            const container = document.getElementById('qweather-widget');
            const toggleBtn = container.querySelector('.weather-toggle-btn');
            const panel = container.querySelector('.weather-panel');

            if (utils.isMobile()) {
                toggleBtn.classList.add('weather-mobile-btn');
                toggleBtn.classList.remove('weather-pc-btn');
                panel.classList.add('weather-panel-mobile');
                panel.classList.remove('weather-panel-pc');
            } else {
                toggleBtn.classList.remove('weather-mobile-btn');
                toggleBtn.classList.add('weather-pc-btn');
                panel.classList.remove('weather-panel-mobile');
                panel.classList.add('weather-panel-pc');
            }
        },

        togglePanel() {
            const container = document.getElementById('qweather-widget');
            const panel = container.querySelector('.weather-panel');

            if (panel.classList.contains('hidden') || (utils.isMobile() && !panel.classList.contains('weather-panel-mobile-active'))) {
                this.showPanel();
            } else {
                this.hidePanel();
            }
        },

        showPanel() {
            const container = document.getElementById('qweather-widget');
            const panel = container.querySelector('.weather-panel');
            const overlay = container.querySelector('.weather-mobile-overlay');
            const toggleBtn = container.querySelector('.weather-toggle-btn');

            // 移除隐藏类
            panel.classList.remove('hidden');

            if (utils.isMobile()) {
                // 移动端特殊处理
                panel.classList.add('weather-panel-mobile-active');
                overlay.classList.add('weather-mobile-overlay-active');
                // 按钮在下层
                toggleBtn.style.zIndex = '10001';
                // 禁用背景滚动
                document.body.style.overflow = 'hidden';
            } else {
                // PC端：使用requestAnimationFrame确保动画正确触发
                // 先强制重绘，确保初始状态被应用
                panel.offsetHeight;
                // 然后添加激活类以触发展开动画
                panel.classList.add('weather-panel-active');
            }

            console.log('显示天气面板');
        },

        hidePanel() {
            const container = document.getElementById('qweather-widget');
            const panel = container.querySelector('.weather-panel');
            const overlay = container.querySelector('.weather-mobile-overlay');
            const toggleBtn = container.querySelector('.weather-toggle-btn');

            if (utils.isMobile()) {
                this.hideMobilePanel();
            } else {
                // PC端：移除激活类以触发收缩动画
                panel.classList.remove('weather-panel-active');

                // 等待过渡动画完成后完全隐藏
                setTimeout(() => {
                    if (!panel.classList.contains('weather-panel-active')) {
                        panel.classList.add('hidden');
                    }
                }, 300);
            }

            console.log('隐藏天气面板');
        },

        hideMobilePanel() {
            const container = document.getElementById('qweather-widget');
            const panel = container.querySelector('.weather-panel');
            const overlay = container.querySelector('.weather-mobile-overlay');
            const toggleBtn = container.querySelector('.weather-toggle-btn');

            panel.classList.remove('weather-panel-mobile-active');
            panel.classList.add('hidden');
            overlay.classList.remove('weather-mobile-overlay-active');

            // 恢复按钮z-index
            toggleBtn.style.zIndex = '10001';

            // 恢复背景滚动
            document.body.style.overflow = '';
        },

        showCitySelectModal() {
            const container = document.getElementById('qweather-widget');
            const modal = container.querySelector('.city-select-modal');
            modal.classList.remove('hidden');

            // 聚焦到位置输入框
            setTimeout(() => {
                container.querySelector('#location-coord-input').focus();
            }, 100);
        },

        hideCitySelectModal() {
            const container = document.getElementById('qweather-widget');
            const modal = container.querySelector('.city-select-modal');
            modal.classList.add('hidden');
        },

        // 新增：自动定位功能
        async autoLocate(inModal = false) {
            const container = document.getElementById('qweather-widget');
            const autoLocateBtn = inModal ?
                container.querySelector('.modal-auto-locate') :
                container.querySelector('.weather-auto-locate-btn');

            // 保存原始按钮状态
            const originalHTML = autoLocateBtn.innerHTML;
            autoLocateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            autoLocateBtn.disabled = true;

            try {
                this.setLoading(true);
                const locationInfo = await utils.autoLocate();

                if (inModal) {
                    // 在模态框中自动填写坐标
                    container.querySelector('#location-name-input').value = locationInfo.locationName;
                    container.querySelector('#location-coord-input').value = locationInfo.location;
                } else {
                    // 直接更新天气数据
                    weatherData.currentLocation = {
                        location: locationInfo.location,
                        locationName: locationInfo.locationName
                    };
                    await weatherApp.loadWeatherData();
                }

                console.log('自动定位成功:', locationInfo);

            } catch (error) {
                console.error('自动定位失败:', error);
                alert(`自动定位失败: ${error.message}`);
            } finally {
                // 恢复按钮状态
                autoLocateBtn.innerHTML = originalHTML;
                autoLocateBtn.disabled = false;
                this.setLoading(false);
            }
        },

        updateUI(data) {
            const container = document.getElementById('qweather-widget');

            // 更新基础信息
            container.querySelector('.city-name').textContent = data.location;
            container.querySelector('.temperature').textContent = `${data.temperature}°`;
            container.querySelector('.high-temp').textContent = `${data.todayHigh}°`;
            container.querySelector('.low-temp').textContent = `${data.todayLow}°`;
            container.querySelector('.weather-description').textContent = data.description;
            container.querySelector('#wind-speed').textContent = `${data.windSpeed} km/h`;
            container.querySelector('#humidity').textContent = `${data.humidity}%`;
            container.querySelector('#feels-like').textContent = `${data.feelsLike}°`;
            container.querySelector('.update-time').textContent = `更新于: ${data.updateTime}`;

            const iconElement = container.querySelector('.weather-icon i');
            iconElement.className = data.icon;

            // 更新24小时预报和日出日落时间
            this.updateHourlyForecast(data.hourlyForecast, data.sunriseTime, data.sunsetTime);

            // 更新7天预报
            this.updateDailyForecast(data.dailyForecast);

            // 显示模拟数据标识
            const mockIndicator = container.querySelector('.mock-indicator');
            if (data.isMock) {
                mockIndicator.classList.remove('hidden');
            } else {
                mockIndicator.classList.add('hidden');
            }

            // 触发AI建议获取
            this.getAIAdvice(data);
        },

        // 新增：获取AI建议
        async getAIAdvice(weatherData) {
            this.setAIAdviceLoading(true);

            try {
                const adviceData = await utils.getAIAdvice(weatherData);
                this.updateAIAdvice(adviceData);
                console.log('AI建议更新完成:', adviceData);
            } catch (error) {
                console.error('获取AI建议失败:', error);
                // 使用默认建议作为降级
                const defaultAdvice = utils.getDefaultAdvice(weatherData);
                this.updateAIAdvice(defaultAdvice);
            } finally {
                this.setAIAdviceLoading(false);
            }
        },

        setLoading(loading) {
            const container = document.getElementById('qweather-widget');
            const panel = container.querySelector('.weather-panel');

            if (loading) {
                panel.classList.add('weather-loading');
            } else {
                panel.classList.remove('weather-loading');
            }
        }
    };

    // 主应用 - 保持原有代码100%不变
    const weatherApp = {
        async init() {
            // 确保Font Awesome已加载
            await this.loadFontAwesome();

            weatherUI.init();

            // 新增：如果启用了自动定位且没有保存的位置，尝试自动定位
            const settings = utils.loadSettings();
            if (weatherConfig.enableAutoLocation &&
                (settings.location === weatherConfig.defaultLocation ||
                    !localStorage.getItem('weather_location'))) {
                try {
                    console.log('尝试自动定位...');
                    const locationInfo = await utils.autoLocate();
                    weatherData.currentLocation = {
                        location: locationInfo.location,
                        locationName: locationInfo.locationName
                    };
                    console.log('初始化自动定位成功:', locationInfo);
                } catch (error) {
                    console.warn('初始化自动定位失败，使用默认位置:', error);
                }
            }

            await this.loadWeatherData();

            if (weatherConfig.autoRefresh) {
                setInterval(() => this.loadWeatherData(), weatherConfig.refreshInterval);
            }
        },

        async loadFontAwesome() {
            if (document.querySelector('link[href*="font-awesome"]')) return;

            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        },

        async loadWeatherData() {
            weatherUI.setLoading(true);

            try {
                const data = await weatherData.fetchWeatherData();
                weatherData.current = data;
                weatherUI.updateUI(data);

            } catch (error) {
                console.error('和风天气数据加载失败，使用模拟数据:', error);

                // 使用模拟数据作为降级方案
                const mockData = weatherData.getMockData();
                weatherUI.updateUI(mockData);
            } finally {
                weatherUI.setLoading(false);
            }
        },

        refreshWeather() {
            this.loadWeatherData();
        }
    };

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => weatherApp.init());
    } else {
        weatherApp.init();
    }
})();