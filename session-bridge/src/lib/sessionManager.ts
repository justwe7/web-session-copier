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
 * 读取指定域名的所有 Cookies（增强版）
 */
async function getCookies(domain: string): Promise<chrome.cookies.Cookie[]> {
  try {
    // 获取当前标签页的完整 URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url) {
      throw new SessionManagerError('无法获取当前标签页 URL', 'NO_TAB_URL');
    }

    const url = new URL(tab.url);
    
    // 尝试多种方式获取 Cookie
    const cookieSets: chrome.cookies.Cookie[][] = [];
    
    // 1. 按域名获取
    try {
      const domainCookies = await chrome.cookies.getAll({ domain: domain });
      cookieSets.push(domainCookies);
    } catch (error) {
      console.warn('按域名获取 Cookie 失败:', error);
    }
    
    // 2. 按 URL 获取
    try {
      const urlCookies = await chrome.cookies.getAll({ url: tab.url });
      cookieSets.push(urlCookies);
    } catch (error) {
      console.warn('按 URL 获取 Cookie 失败:', error);
    }
    
    // 3. 尝试获取主域名的 Cookie
    try {
      const parts = domain.split('.');
      if (parts.length > 2) {
        const rootDomain = '.' + parts.slice(-2).join('.');
        const rootCookies = await chrome.cookies.getAll({ domain: rootDomain });
        cookieSets.push(rootCookies);
      }
    } catch (error) {
      console.warn('按根域名获取 Cookie 失败:', error);
    }
    
    // 4. 通过 content script 获取 document.cookie
    try {
      if (tab.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            try {
              return document.cookie;
            } catch (error) {
              return '';
            }
          }
        });
        
        const documentCookies = results[0]?.result || '';
        if (documentCookies) {
          console.log('从 document.cookie 获取到:', documentCookies);
          // 解析 document.cookie 字符串并转换为 Cookie 对象
          const parsedCookies = parseDocumentCookies(documentCookies, domain);
          cookieSets.push(parsedCookies);
        }
      }
    } catch (error) {
      console.warn('通过 content script 获取 Cookie 失败:', error);
    }
    
    // 合并并去重所有 Cookie
    const allCookies = new Map<string, chrome.cookies.Cookie>();
    
    cookieSets.forEach(cookies => {
      cookies.forEach(cookie => {
        const key = `${cookie.name}-${cookie.domain}-${cookie.path}`;
        if (!allCookies.has(key) || cookie.value) {
          allCookies.set(key, cookie);
        }
      });
    });
    
    const finalCookies = Array.from(allCookies.values());
    console.log(`成功获取 ${finalCookies.length} 个 Cookie`);
    
    return finalCookies;
  } catch (error) {
    throw new SessionManagerError(
      `读取 Cookies 失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'GET_COOKIES_FAILED'
    );
  }
}

/**
 * 解析 document.cookie 字符串为 Cookie 对象数组
 */
function parseDocumentCookies(cookieString: string, domain: string): chrome.cookies.Cookie[] {
  if (!cookieString) return [];
  
  const cookies: chrome.cookies.Cookie[] = [];
  const cookiePairs = cookieString.split(';');
  
  cookiePairs.forEach(pair => {
    const [name, value] = pair.trim().split('=');
    if (name && value !== undefined) {
      cookies.push({
        name: name.trim(),
        value: value.trim(),
        domain: domain,
        hostOnly: false,
        path: '/',
        secure: false,
        httpOnly: false,
        sameSite: 'no_restriction',
        session: true,
        storeId: 'default'
      });
    }
  });
  
  return cookies;
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
 * 包括 Cookies, LocalStorage, SessionStorage
 */
export async function getSession(): Promise<SessionData> {
  try {
    const domain = await getCurrentDomain();
    
    // 并行获取所有数据以提高性能
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
 * 设置指定的 Cookies
 */
async function setCookies(cookies: chrome.cookies.Cookie[], targetDomain: string): Promise<void> {
  try {
    const setPromises = cookies.map(async (cookie) => {
      // 构建 cookie 设置参数
      const details: chrome.cookies.SetDetails = {
        url: `https://${targetDomain}${cookie.path || '/'}`,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      };

      // 如果有过期时间，设置过期时间
      if (cookie.expirationDate) {
        details.expirationDate = cookie.expirationDate;
      }

      try {
        await chrome.cookies.set(details);
        console.log(`Cookie 设置成功: ${cookie.name}`);
      } catch (error) {
        console.warn(`Cookie 设置失败: ${cookie.name}`, error);
        throw new SessionManagerError(
          `设置 Cookie "${cookie.name}" 失败: ${error instanceof Error ? error.message : '未知错误'}`,
          'SET_COOKIE_FAILED'
        );
      }
    });

    await Promise.allSettled(setPromises);
    console.log(`成功处理 ${cookies.length} 个 Cookie`);
  } catch (error) {
    throw new SessionManagerError(
      `批量设置 Cookies 失败: ${error instanceof Error ? error.message : '未知错误'}`,
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
          // 清空现有 localStorage
          localStorage.clear();
          
          // 设置新数据
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
          // 清空现有 sessionStorage
          sessionStorage.clear();
          
          // 设置新数据
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
 * 包括 Cookies, LocalStorage, SessionStorage
 */
export async function setSession(sessionData: SessionData): Promise<void> {
  try {
    // 验证输入数据
    if (!validateSessionData(sessionData)) {
      throw new SessionManagerError('会话数据格式无效', 'INVALID_SESSION_DATA');
    }

    // 获取当前域名以验证匹配
    const currentDomain = await getCurrentDomain();
    
    // 可选：验证域名匹配（可以注释掉以支持跨域应用）
    // if (sessionData.domain !== currentDomain) {
    //   throw new SessionManagerError(
    //     `域名不匹配: 会话数据来自 ${sessionData.domain}，当前页面为 ${currentDomain}`,
    //     'DOMAIN_MISMATCH'
    //   );
    // }

    console.log('开始应用会话数据:', {
      targetDomain: currentDomain,
      sourceDomain: sessionData.domain,
      cookiesCount: sessionData.cookies.length,
      localStorageKeys: Object.keys(sessionData.localStorage).length,
      sessionStorageKeys: Object.keys(sessionData.sessionStorage).length
    });

    // 并行应用所有数据以提高性能
    const results = await Promise.allSettled([
      setCookies(sessionData.cookies, currentDomain),
      setLocalStorage(sessionData.localStorage),
      setSessionStorage(sessionData.sessionStorage)
    ]);

    // 检查结果并报告任何失败
    const failures: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const operations = ['Cookies', 'LocalStorage', 'SessionStorage'];
        failures.push(`${operations[index]}: ${result.reason.message}`);
      }
    });

    if (failures.length > 0) {
      throw new SessionManagerError(
        `部分会话数据应用失败: ${failures.join('; ')}`,
        'PARTIAL_SESSION_APPLY_FAILED'
      );
    }

    console.log('会话数据应用成功');
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
