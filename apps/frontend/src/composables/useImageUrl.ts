import { IMAGE_BASE_URL } from '../config';

/**
 * 图片 URL 处理 composable
 */
export function useImageUrl() {
  /**
   * 获取缩略图 URL
   * @param comicPath 漫画路径
   * @param imagePath 图片路径
   * @returns 完整的缩略图 URL
   */
  const getThumbnailUrl = (comicPath: string, imagePath: string) => {
    return `${IMAGE_BASE_URL}/images/thumbnail?comicPath=${encodeURIComponent(comicPath)}&imagePath=${encodeURIComponent(imagePath)}`;
  };

  /**
   * 获取完整图片 URL
   * @param comicPath 漫画路径
   * @param imagePath 图片路径
   * @returns 完整的图片 URL
   */
  const getImageUrl = (comicPath: string, imagePath: string) => {
    return `${IMAGE_BASE_URL}/images?comicPath=${encodeURIComponent(comicPath)}&imagePath=${encodeURIComponent(imagePath)}`;
  };

  /**
   * 获取封面图片 URL
   * @param comicPath 漫画路径
   * @param coverPath 封面路径
   * @returns 完整的封面 URL
   */
  const getCoverUrl = (comicPath: string, coverPath?: string) => {
    if (!coverPath) return '/placeholder-cover.jpg';
    return getThumbnailUrl(comicPath, coverPath);
  };

  /**
   * 图片加载失败时的默认处理
   * @param event 错误事件
   * @param fallbackSrc 备用图片地址
   */
  const handleImageError = (
    event: Event,
    fallbackSrc: string = '/placeholder-cover.jpg',
  ) => {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = fallbackSrc;
    }
  };

  return {
    getThumbnailUrl,
    getImageUrl,
    getCoverUrl,
    handleImageError,
  };
}
