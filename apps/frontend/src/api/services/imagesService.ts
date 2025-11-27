import { API_BASE_URL, API_ENDPOINTS } from '../config';

/**
 * 图片服务
 */
export const imagesService = {
  /**
   * 获取图片 URL
   */
  getImageUrl(comicPath: string, imagePath: string): string {
    const params = new URLSearchParams({
      comicPath,
      imagePath,
    });
    return `${API_BASE_URL}${API_ENDPOINTS.images.view}?${params}`;
  },

  /**
   * 获取缩略图 URL
   */
  getThumbnailUrl(
    comicPath: string,
    imagePath: string,
    width: number = 200,
    height: number = 300,
  ): string {
    const params = new URLSearchParams({
      comicPath,
      imagePath,
      width: String(width),
      height: String(height),
    });
    return `${API_BASE_URL}${API_ENDPOINTS.images.thumbnail}?${params}`;
  },

  /**
   * 预加载图片
   */
  async preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  },

  /**
   * 批量预加载图片
   */
  async preloadImages(urls: string[], concurrency: number = 3): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map((url) =>
        this.preloadImage(url).catch(() => {}),
      );
      promises.push(...batchPromises);

      // 等待当前批次完成再继续
      await Promise.all(batchPromises);
    }
  },
};
