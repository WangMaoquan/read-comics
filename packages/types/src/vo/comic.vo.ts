import type { ComicStatus, ComicFormat, ReadingProgress } from '../comic';

/**
 * 漫画列表项 VO
 * 适用场景：首页列表、搜索结果、收藏列表
 */
export interface ComicListItemVO {
  /** 漫画 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 作者 */
  author?: string;
  /** 封面图片路径 */
  cover?: string;
  /** 阅读状态 (未读/阅读中/已完结) */
  status: ComicStatus;
  /** 是否已收藏 */
  isFavorite?: boolean;
  /** 总页数 */
  totalPages: number;
  /** 最后阅读时间 */
  lastReadAt?: Date;
  /** 整体阅读进度 (0-100) */
  progress?: number;
}

/**
 * 漫画详情 VO
 * 适用场景：漫画详情页
 */
export interface ComicDetailVO {
  /** 漫画 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 作者 */
  author?: string;
  /** 封面图片路径 */
  cover?: string;
  /** 阅读状态 */
  status: ComicStatus;
  /** 是否已收藏 */
  isFavorite?: boolean;
  /** 总页数 */
  totalPages: number;
  /** 文件大小 (字节) */
  fileSize: number;
  /** 文件格式 (cbz/zip/etc) */
  fileFormat: ComicFormat;
  /** 创建时间 (入库时间) */
  createdAt: Date;
  /** 最后阅读时间 */
  lastReadAt?: Date;
  /** 整体阅读进度 (0-100) */
  progress?: number;
  /** 最近一次的详细阅读进度记录（用于"继续阅读"按钮） */
  readingProgress?: ReadingProgress;
}
