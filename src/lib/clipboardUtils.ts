/**
 * 剪贴板工具模块
 * 提供增强的剪贴板读写功能
 */

export class ClipboardError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ClipboardError';
  }
}

/**
 * 检查剪贴板 API 是否可用
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.readText);
}

/**
 * 安全地写入剪贴板（带备用方案）
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!text || text.trim().length === 0) {
    throw new ClipboardError('没有内容可复制', 'EMPTY_CONTENT');
  }

  // 尝试现代剪贴板 API
  if (isClipboardAvailable()) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('内容已复制到剪贴板 (Clipboard API)');
      return;
    } catch (error) {
      console.warn('Clipboard API 失败，尝试备用方案:', error);
    }
  }

  // 备用方案：使用传统方法
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (!successful) {
      throw new Error('execCommand copy 失败');
    }
    
    console.log('内容已复制到剪贴板 (execCommand)');
  } catch (fallbackError) {
    throw new ClipboardError(
      `复制到剪贴板失败: ${fallbackError instanceof Error ? fallbackError.message : '未知错误'}`,
      'COPY_FAILED'
    );
  }
}

/**
 * 安全地从剪贴板读取（带权限检查）
 */
export async function readFromClipboard(): Promise<string> {
  if (!isClipboardAvailable()) {
    throw new ClipboardError('剪贴板 API 不可用，请手动粘贴会话数据', 'CLIPBOARD_NOT_AVAILABLE');
  }

  try {
    // 首先检查权限
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'denied') {
          throw new ClipboardError(
            '剪贴板读取权限被拒绝，请在浏览器设置中允许此扩展访问剪贴板',
            'PERMISSION_DENIED'
          );
        }
      } catch (permError) {
        // 权限 API 可能不支持，继续尝试读取
        console.warn('无法检查剪贴板权限:', permError);
      }
    }

    const text = await navigator.clipboard.readText();
    console.log('从剪贴板读取内容成功');
    return text;
  } catch (error) {
    if (error instanceof ClipboardError) {
      throw error;
    }

    // 处理权限错误
    if (error instanceof Error && error.message.includes('permission denied')) {
      throw new ClipboardError(
        '剪贴板读取权限被拒绝。请尝试：1) 刷新页面后重试 2) 检查浏览器剪贴板权限设置',
        'PERMISSION_DENIED'
      );
    }

    throw new ClipboardError(
      `从剪贴板读取失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'READ_FAILED'
    );
  }
}

/**
 * 验证剪贴板内容是否为有效的 JSON
 */
export function validateClipboardJSON(text: string): { isValid: boolean; data?: any; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: '剪贴板内容为空' };
  }

  try {
    const data = JSON.parse(text);
    return { isValid: true, data };
  } catch (error) {
    return { 
      isValid: false, 
      error: `JSON 格式无效: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}

/**
 * 格式化 JSON 字符串以便复制
 */
export function formatJSONForClipboard(data: any, indent: number = 2): string {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    throw new ClipboardError(
      `JSON 序列化失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'JSON_SERIALIZE_FAILED'
    );
  }
}

/**
 * 获取剪贴板内容的基本信息
 */
export async function getClipboardInfo(): Promise<{
  hasContent: boolean;
  contentLength: number;
  isJSON: boolean;
  preview: string;
}> {
  try {
    const text = await readFromClipboard();
    const validation = validateClipboardJSON(text);
    
    return {
      hasContent: text.length > 0,
      contentLength: text.length,
      isJSON: validation.isValid,
      preview: text.length > 50 ? text.substring(0, 50) + '...' : text
    };
  } catch (error) {
    return {
      hasContent: false,
      contentLength: 0,
      isJSON: false,
      preview: '无法读取剪贴板内容'
    };
  }
}
