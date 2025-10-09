/**
 * 会话管理器 - 负责读取和写入浏览器会话数据
 * 包括 Cookies, LocalStorage, SessionStorage
 */

// 会话数据接口定义
export interface SessionData {
  cookies: chrome.cookies.Cookie[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  domain: string;
  timestamp: number;
}

// 错误类型定义
export class SessionManagerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SessionManagerError';
  }
}

/**
 * 获取当前活动标签页的域名
 */
async function getCurrentDomain(): Promise<string> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url) {
      throw new SessionManagerError('无法获取当前标签页 URL', 'NO_TAB_URL');
    }
    
    const url = new URL(tab.url);
    return url.hostname;
  } catch (error) {
    throw new SessionManagerError(
      `获取当前域名失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_DOMAIN_FAILED'
    );
  }
}

/**
 * 读取指定域名的所有 Cookies
 */
async function getCookies(domain: string): Promise<chrome.cookies.Cookie[]> {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    console.log(`获取到 ${cookies.length} 个 Cookie`);
    return cookies;
  } catch (error) {
    throw new SessionManagerError(
      `读取 Cookies 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_COOKIES_FAILED'
    );
  }
}

/**
 * 通过 content script 获取 localStorage 数据
 */
async function getLocalStorage(): Promise<Record<string, string>> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new SessionManagerError('无法获取当前标签页 ID', 'NO_TAB_ID');
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key) || '';
          }
        }
        return data;
      }
    });

    return results[0]?.result || {};
  } catch (error) {
    throw new SessionManagerError(
      `读取 LocalStorage 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_LOCALSTORAGE_FAILED'
    );
  }
}

/**
 * 通过 content script 获取 sessionStorage 数据
 */
async function getSessionStorage(): Promise<Record<string, string>> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new SessionManagerError('无法获取当前标签页 ID', 'NO_TAB_ID');
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const data: Record<string, string> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data[key] = sessionStorage.getItem(key) || '';
          }
        }
        return data;
      }
    });

    return results[0]?.result || {};
  } catch (error) {
    throw new SessionManagerError(
      `读取 SessionStorage 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_SESSIONSTORAGE_FAILED'
    );
  }
}

/**
 * 获取当前页面的完整会话数据
 */
export async function getSession(): Promise<SessionData> {
  try {
    const domain = await getCurrentDomain();
    
    const [cookies, localStorage, sessionStorage] = await Promise.all([
      getCookies(domain),
      getLocalStorage(),
      getSessionStorage()
    ]);

    const sessionData: SessionData = {
      cookies,
      localStorage,
      sessionStorage,
      domain,
      timestamp: Date.now()
    };

    console.log('会话数据读取成功:', {
      domain,
      cookiesCount: cookies.length,
      localStorageKeys: Object.keys(localStorage).length,
      sessionStorageKeys: Object.keys(sessionStorage).length
    });

    return sessionData;
  } catch (error) {
    if (error instanceof SessionManagerError) {
      throw error;
    }
    
    throw new SessionManagerError(
      `获取会话数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_SESSION_FAILED'
    );
  }
}

/**
 * 通过 JavaScript 脚本注入设置 Cookie 数据
 * 使用 document.cookie 方式，确保在开发者工具中可见
 */
async function setCookies(cookies: chrome.cookies.Cookie[], targetDomain: string): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new SessionManagerError('无法获取当前标签页 ID', 'NO_TAB_ID');
    }

    if (!tab.url) {
      throw new SessionManagerError('无法获取当前标签页 URL', 'NO_TAB_URL');
    }

    console.log(`🍪 [Cookie 设置] 开始设置 ${cookies.length} 个 Cookie 到域名: ${targetDomain}`);

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (cookieData: chrome.cookies.Cookie[], currentDomain: string) => {
        try {
          // 清除现有的 Cookie（可选，根据需求决定）
          // document.cookie.split(";").forEach(function(c) { 
          //   document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          // });

          let successCount = 0;
          let errorCount = 0;

          for (const cookie of cookieData) {
            try {
              // 构建完整的 Cookie 字符串，包含所有必要的属性
              let cookieString = `${cookie.name}=${cookie.value}`;
              
              // 添加路径
              if (cookie.path) {
                cookieString += `; path=${cookie.path}`;
              } else {
                cookieString += '; path=/';
              }
              
              // 添加域名（如果指定且与当前域名匹配）
              if (cookie.domain && cookie.domain !== currentDomain) {
                // 注意：JavaScript 只能设置当前域名或子域名的 Cookie
                // 如果域名不匹配，可能需要调整或跳过
                if (cookie.domain.endsWith(currentDomain) || currentDomain.endsWith(cookie.domain)) {
                  cookieString += `; domain=${cookie.domain}`;
                } else {
                  console.warn(`跳过跨域 Cookie: ${cookie.name} (${cookie.domain})`);
                  continue;
                }
              }
              
              // 添加过期时间
              if (cookie.expirationDate) {
                const expirationDate = new Date(cookie.expirationDate * 1000);
                cookieString += `; expires=${expirationDate.toUTCString()}`;
              }
              
              // 添加安全标志
              if (cookie.secure) {
                cookieString += '; secure';
              }
              
              // 添加 HttpOnly 标志（注意：JavaScript 无法设置 HttpOnly，但我们可以记录）
              if (cookie.httpOnly) {
                console.log(`注意: Cookie ${cookie.name} 标记为 HttpOnly，JavaScript 无法设置此标志`);
              }
              
              // 添加 SameSite 属性
              if (cookie.sameSite) {
                cookieString += `; samesite=${cookie.sameSite}`;
              }

              // 设置 Cookie
              document.cookie = cookieString;
              successCount++;
              
              console.log(`✅ Cookie 设置成功: ${cookie.name}=${cookie.value}`);
            } catch (cookieError) {
              console.error(`❌ Cookie 设置失败: ${cookie.name}`, cookieError);
              errorCount++;
            }
          }

          console.log(`🍪 Cookie 设置完成: 成功 ${successCount} 个, 失败 ${errorCount} 个`);
          return { 
            success: true, 
            successCount, 
            errorCount, 
            total: cookieData.length 
          };
        } catch (error) {
          console.error('Cookie 设置过程中发生错误:', error);
          throw error;
        }
      },
      args: [cookies, targetDomain]
    });

    console.log(`🍪 [Cookie 设置] 脚本执行完成，Cookie 数据已应用到页面`);
  } catch (error) {
    console.error(`💥 [Cookie 设置] 设置失败:`, error);
    throw new SessionManagerError(
      `设置 Cookie 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'SET_COOKIES_FAILED'
    );
  }
}

/**
 * 通过 content script 设置 localStorage 数据
 */
async function setLocalStorage(data: Record<string, string>): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new SessionManagerError('无法获取当前标签页 ID', 'NO_TAB_ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (storageData: Record<string, string>) => {
        try {
          localStorage.clear();
          for (const [key, value] of Object.entries(storageData)) {
            localStorage.setItem(key, value);
          }
          console.log(`LocalStorage 设置成功，共 ${Object.keys(storageData).length} 项`);
          return { success: true, count: Object.keys(storageData).length };
        } catch (error) {
          console.error('LocalStorage 设置失败:', error);
          throw error;
        }
      },
      args: [data]
    });

    console.log(`LocalStorage 数据应用成功`);
  } catch (error) {
    throw new SessionManagerError(
      `设置 LocalStorage 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'SET_LOCALSTORAGE_FAILED'
    );
  }
}

/**
 * 通过 content script 设置 sessionStorage 数据
 */
async function setSessionStorage(data: Record<string, string>): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new SessionManagerError('无法获取当前标签页 ID', 'NO_TAB_ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (storageData: Record<string, string>) => {
        try {
          sessionStorage.clear();
          for (const [key, value] of Object.entries(storageData)) {
            sessionStorage.setItem(key, value);
          }
          console.log(`SessionStorage 设置成功，共 ${Object.keys(storageData).length} 项`);
          return { success: true, count: Object.keys(storageData).length };
        } catch (error) {
          console.error('SessionStorage 设置失败:', error);
          throw error;
        }
      },
      args: [data]
    });

    console.log(`SessionStorage 数据应用成功`);
  } catch (error) {
    throw new SessionManagerError(
      `设置 SessionStorage 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'SET_SESSIONSTORAGE_FAILED'
    );
  }
}

/**
 * 应用会话数据到当前页面
 */
export async function setSession(sessionData: SessionData): Promise<void> {
  try {
    if (!validateSessionData(sessionData)) {
      throw new SessionManagerError('会话数据格式无效', 'INVALID_SESSION_DATA');
    }

    const currentDomain = await getCurrentDomain();
    
    console.log('🚀 [会话应用] 开始应用会话数据:', {
      targetDomain: currentDomain,
      sourceDomain: sessionData.domain,
      cookiesCount: sessionData.cookies.length,
      localStorageKeys: Object.keys(sessionData.localStorage).length,
      sessionStorageKeys: Object.keys(sessionData.sessionStorage).length
    });

    // 并行应用所有数据
    const results = await Promise.allSettled([
      setCookies(sessionData.cookies, currentDomain),
      setLocalStorage(sessionData.localStorage),
      setSessionStorage(sessionData.sessionStorage)
    ]);

    // 分析结果
    const operations = ['Cookies', 'LocalStorage', 'SessionStorage'];
    const successes: string[] = [];
    const failures: string[] = [];
    
    results.forEach((result, index) => {
      const operation = operations[index];
      
      if (result.status === 'fulfilled') {
        successes.push(operation);
        console.log(`✅ [会话应用] ${operation} 应用成功`);
      } else {
        const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        failures.push(`${operation}: ${errorMsg}`);
        console.error(`❌ [会话应用] ${operation} 应用失败:`, result.reason);
      }
    });

    console.log('📊 会话数据应用结果:', { 
      成功: successes, 
      失败: failures.length > 0 ? failures : '无',
      总计: `${successes.length}/${operations.length} 成功`
    });

    if (successes.includes('Cookies') && sessionData.cookies.length > 0) {
      console.log(`💡 [提示] Cookie 已设置完成，如果页面没有反应，请尝试刷新页面 (F5) 来查看效果`);
      console.log(`💡 [提示] 你也可以打开开发者工具 -> Application -> Cookies 查看设置的 Cookie`);
    }

  } catch (error) {
    if (error instanceof SessionManagerError) {
      throw error;
    }
    
    throw new SessionManagerError(
      `应用会话数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'SET_SESSION_FAILED'
    );
  }
}

/**
 * 验证会话数据的完整性
 */
export function validateSessionData(data: any): data is SessionData {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.cookies) &&
    typeof data.localStorage === 'object' &&
    typeof data.sessionStorage === 'object' &&
    typeof data.domain === 'string' &&
    typeof data.timestamp === 'number'
  );
}

/**
 * 清除当前页面的所有会话数据
 */
export async function clearSession(): Promise<void> {
  try {
    const currentDomain = await getCurrentDomain();
    
    // 清除 Cookies
    const cookies = await chrome.cookies.getAll({ domain: currentDomain });
    const removeCookiePromises = cookies.map(cookie => 
      chrome.cookies.remove({
        url: `https://${currentDomain}${cookie.path}`,
        name: cookie.name
      })
    );
    
    // 清除 Storage
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          localStorage.clear();
          sessionStorage.clear();
        }
      });
    }

    await Promise.all(removeCookiePromises);
    console.log('会话数据清除成功');
  } catch (error) {
    throw new SessionManagerError(
      `清除会话数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'CLEAR_SESSION_FAILED'
    );
  }
}
