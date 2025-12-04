import type { ReadingMode, Theme } from '../comic';

/**
 * 用户信息 VO
 * 适用场景：用户信息展示、管理列表
 */
export interface UserVO {
  /** 用户 ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 角色 (admin/user) */
  role: 'admin' | 'user';
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 用户偏好设置 VO
 * 适用场景：用户设置页面、应用初始化
 */
export interface UserPreferencesVO {
  /** 偏好设置 ID */
  id: string;
  /** 阅读模式 (单页/双页/滚动) */
  readingMode: ReadingMode;
  /** 主题 (明亮/暗黑/自动) */
  theme: Theme;
  /** 语言 */
  language: string;
  /** 是否自动保存进度 */
  autoSaveProgress: boolean;
  /** 是否启用翻页动画 */
  pageTransition: boolean;
  /** 是否显示页码 */
  showPageNumbers: boolean;
  /** 是否启用双页模式 (旧字段，建议使用 readingMode) */
  doublePageMode: boolean;
  /** 是否适应屏幕宽度 */
  fitToScreen: boolean;
  /** 更新时间 */
  updatedAt: Date;
}
