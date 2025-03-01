// 测试QB状态API的简单脚本
// 使用方法: node test-api.js

import axios from 'axios';
import { Buffer } from 'buffer';

// 测试配置
const testConfig = {
  id: 'test',
  name: 'Test QB',
  url: 'http://localhost:8080',  // 替换为你的QB WebUI地址
  username: 'admin',             // 替换为你的QB用户名
  password: 'adminadmin',        // 替换为你的QB密码
  updateInterval: 30,
  displayItems: {
    downloadSpeed: true,
    uploadSpeed: true,
    activeDownloads: true,
    activeTorrents: true,
    pausedTorrents: true,
    completedTorrents: true,
    totalTorrents: true,
    globalRatio: true,
    globalDownloaded: true,
    globalUploaded: true,
    freeSpace: true
  }
};

// 测试连接API
async function testConnection() {
  try {
    console.log('测试连接API...');
    const response = await axios.post('http://localhost:3001/api/widgets/qb-status/test', {
      url: testConfig.url,
      username: testConfig.username,
      password: testConfig.password
    });
    
    console.log('连接测试结果:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('连接测试失败:', error.message);
    return false;
  }
}

// 测试状态API
async function testStatus() {
  try {
    console.log('测试状态API...');
    
    // 将配置转换为Base64
    const configBase64 = Buffer.from(JSON.stringify(testConfig)).toString('base64');
    
    const response = await axios.get(`http://localhost:3001/api/widgets/qb-status?config=${configBase64}`);
    
    console.log('状态API结果:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('状态API测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试QB状态API...');
  console.log('使用的配置:', testConfig);
  
  const connectionSuccess = await testConnection();
  
  if (connectionSuccess) {
    console.log('连接测试成功，继续测试状态API...');
    await testStatus();
  } else {
    console.log('连接测试失败，请检查QB WebUI地址、用户名和密码');
  }
  
  console.log('测试完成');
}

runTests(); 