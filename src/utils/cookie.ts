/**
 * 解析cookie字符串
 *
 * @param cookieStr cookie字符串
 * @param options 可选参数
 * @returns 返回解析后的cookie对象数组
 */
export const cookieParse = (cookieStr, options?) => {
  const cookieParams = options?.cookieParams || {};

  return cookieStr.split(';').map(item => {
    const items = item.split('=');
    return {
      name: items[0]?.trim(),
      value: items[1]?.trim(),
      ...cookieParams,
    };
  });
};
