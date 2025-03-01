/**
 * Transmission API测试工具
 * 用于测试与Transmission的连接和API调用
 */

// 测试Transmission连接
export async function testConnection(url, username, password) {
  try {
    // 初始化会话ID
    let sessionId = ''
    
    // 第一次请求，可能会收到会话ID
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Transmission-Session-Id': sessionId
        },
        body: JSON.stringify({
          method: 'session-get',
          tag: 1
        }),
        credentials: username && password ? 'include' : 'omit'
      })
      
      // 如果直接成功，返回成功
      if (response.ok) {
        const data = await response.json()
        console.log('连接成功，服务器返回:', data)
        return { success: true, message: '连接成功', data }
      }
      
      // 检查是否是409错误（需要会话ID）
      if (response.status === 409) {
        sessionId = response.headers.get('x-transmission-session-id')
        console.log('获取到会话ID:', sessionId)
        
        // 使用获取的会话ID再次尝试
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transmission-Session-Id': sessionId
          },
          body: JSON.stringify({
            method: 'session-get',
            tag: 1
          }),
          credentials: username && password ? 'include' : 'omit'
        })
        
        if (retryResponse.ok) {
          const data = await retryResponse.json()
          console.log('连接成功，服务器返回:', data)
          return { success: true, message: '连接成功', data }
        } else {
          console.error('重试连接失败:', retryResponse.status, retryResponse.statusText)
          return { success: false, message: `连接失败: ${retryResponse.status} ${retryResponse.statusText}` }
        }
      } else {
        console.error('连接失败:', response.status, response.statusText)
        return { success: false, message: `连接失败: ${response.status} ${response.statusText}` }
      }
    } catch (error) {
      console.error('连接请求异常:', error)
      return { success: false, message: `连接异常: ${error.message}` }
    }
  } catch (error) {
    console.error('测试连接异常:', error)
    return { success: false, message: `测试异常: ${error.message}` }
  }
}

// 获取Transmission会话信息
export async function getSessionInfo(url, username, password, sessionId) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Transmission-Session-Id': sessionId
      },
      body: JSON.stringify({
        method: 'session-get',
        tag: 2
      }),
      credentials: username && password ? 'include' : 'omit'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('获取会话信息成功:', data)
      return { success: true, data }
    } else if (response.status === 409) {
      // 需要更新会话ID
      const newSessionId = response.headers.get('x-transmission-session-id')
      console.log('会话ID已过期，获取新会话ID:', newSessionId)
      return { success: false, needNewSession: true, sessionId: newSessionId }
    } else {
      console.error('获取会话信息失败:', response.status, response.statusText)
      return { success: false, message: `获取失败: ${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.error('获取会话信息异常:', error)
    return { success: false, message: `获取异常: ${error.message}` }
  }
}

// 获取Transmission统计信息
export async function getSessionStats(url, username, password, sessionId) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Transmission-Session-Id': sessionId
      },
      body: JSON.stringify({
        method: 'session-stats',
        tag: 3
      }),
      credentials: username && password ? 'include' : 'omit'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('获取统计信息成功:', data)
      return { success: true, data }
    } else if (response.status === 409) {
      // 需要更新会话ID
      const newSessionId = response.headers.get('x-transmission-session-id')
      console.log('会话ID已过期，获取新会话ID:', newSessionId)
      return { success: false, needNewSession: true, sessionId: newSessionId }
    } else {
      console.error('获取统计信息失败:', response.status, response.statusText)
      return { success: false, message: `获取失败: ${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.error('获取统计信息异常:', error)
    return { success: false, message: `获取异常: ${error.message}` }
  }
}

// 获取Transmission种子列表
export async function getTorrents(url, username, password, sessionId) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Transmission-Session-Id': sessionId
      },
      body: JSON.stringify({
        method: 'torrent-get',
        arguments: {
          fields: [
            'id', 'name', 'status', 'percentDone', 'rateDownload', 'rateUpload',
            'uploadRatio', 'downloadedEver', 'uploadedEver', 'sizeWhenDone',
            'error', 'errorString'
          ]
        },
        tag: 4
      }),
      credentials: username && password ? 'include' : 'omit'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('获取种子列表成功:', data)
      return { success: true, data }
    } else if (response.status === 409) {
      // 需要更新会话ID
      const newSessionId = response.headers.get('x-transmission-session-id')
      console.log('会话ID已过期，获取新会话ID:', newSessionId)
      return { success: false, needNewSession: true, sessionId: newSessionId }
    } else {
      console.error('获取种子列表失败:', response.status, response.statusText)
      return { success: false, message: `获取失败: ${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.error('获取种子列表异常:', error)
    return { success: false, message: `获取异常: ${error.message}` }
  }
} 