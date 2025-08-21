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
