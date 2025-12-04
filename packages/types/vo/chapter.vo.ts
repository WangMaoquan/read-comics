import type { ReadingProgress } from '../comic';

/**
 * 章节列表项 VO
 * 适用场景：漫画详情页的章节列表
 */
export interface ChapterListItemVO {
  /** 章节 ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节序号 */
  pageNumber: number;
  /** 更新时间 */
  updatedAt: Date;
  /** 该章节的阅读进度 */
  readingProgress?: ReadingProgress;
}

/**
 * 章节详情 VO
 * 适用场景：阅读器 (Reader)
 */
export interface ChapterDetailVO {
  /** 章节 ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节序号 */
  pageNumber: number;
  /** 图片基础路径 (用于构建图片 URL) */
  imagePath: string;
  /** 包含的所有图片文件名列表 */
  pages: string[];
  /** 更新时间 */
  updatedAt: Date;
  /** 该章节的阅读进度 */
  readingProgress?: ReadingProgress;
}
