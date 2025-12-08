/**
 * 统计数据 VO
 * 适用场景：仪表盘、统计页面
 */
export interface ComicStatsVO {
  /** 总漫画数量 */
  totalComics: number;
  /** 总页数 */
  totalPages: number;
  /** 已读完漫画数量 */
  completedComics: number;
  /** 正在阅读漫画数量 */
  readingComics: number;
  /** 未读漫画数量 */
  unreadComics: number;
  /** 总阅读时长 (分钟) */
  totalReadingTime: number;
  /** 平均评分 */
  averageRating: number;
}
