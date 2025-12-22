/**
 * 日志配置
 * 用于控制日志的详细程度和行为
 */
export const LoggingConfig = {
  /**
   * 是否启用详细的控制台日志
   * 生产环境建议设置为 false
   */
  enableDetailedLogs: process.env.NODE_ENV !== 'production',

  /**
   * 是否打印请求体
   */
  logRequestBody: true,

  /**
   * 是否打印响应体
   */
  logResponseBody: true,

  /**
   * 响应体最大打印长度(字符)
   * 超过此长度将只显示长度信息
   */
  maxResponseBodyLength: 500,

  /**
   * 是否打印查询参数
   */
  logQueryParams: true,

  /**
   * 是否打印路由参数
   */
  logRouteParams: true,

  /**
   * 是否打印用户信息
   */
  logUserInfo: true,

  /**
   * 是否打印 IP 地址
   */
  logIpAddress: true,

  /**
   * 是否打印 User Agent
   */
  logUserAgent: true,

  /**
   * 需要脱敏的字段名称
   */
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'secretKey',
  ],

  /**
   * 需要忽略日志的路径(正则表达式)
   */
  ignoredPaths: [/\/health$/, /\/favicon\.ico$/, /\/api\/docs/],

  /**
   * 慢请求阈值(毫秒)
   * 超过此时间的请求会特别标记
   */
  slowRequestThreshold: 500,

  /**
   * 是否在数据库中记录日志
   * 只记录修改性操作(POST/PUT/PATCH/DELETE)
   */
  enableDatabaseLogs: true,
};
