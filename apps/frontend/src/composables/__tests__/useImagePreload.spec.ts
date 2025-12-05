import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useImagePreload } from '../useImagePreload';

// Mock performance monitor
vi.mock('@/utils/performance', () => ({
  performanceMonitor: {
    start: vi.fn(),
    end: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';

describe('useImagePreload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preload next images', () => {
    const pages = ref([
      'http://example.com/image1.jpg',
      'http://example.com/image2.jpg',
      'http://example.com/image3.jpg',
      'http://example.com/image4.jpg',
    ]);
    const currentPage = ref(0);

    const { preloadImages } = useImagePreload(pages, currentPage);

    // Mock Image constructor
    const images: any[] = [];
    global.Image = vi.fn(() => {
      const img = { src: '' };
      images.push(img);
      return img;
    }) as unknown as typeof Image;

    preloadImages();

    // 应该预加载 3 张图片（index 1, 2, 3）
    expect(images.length).toBe(3);
    expect(images[0].src).toBe('http://example.com/image2.jpg');
    expect(images[1].src).toBe('http://example.com/image3.jpg');
    expect(images[2].src).toBe('http://example.com/image4.jpg');

    expect(performanceMonitor.start).toHaveBeenCalledWith(
      'Reader:preloadImages',
    );
    expect(performanceMonitor.end).toHaveBeenCalledWith('Reader:preloadImages');
  });

  it('should not preload if at end of pages', () => {
    const pages = ref(['http://example.com/image1.jpg']);
    const currentPage = ref(0);

    const { preloadImages } = useImagePreload(pages, currentPage);

    global.Image = vi.fn() as unknown as typeof Image;

    preloadImages();

    // 没有后续页面，不应该创建 Image
    expect(global.Image).not.toHaveBeenCalled();
  });

  it('should limit preload count to available pages', () => {
    const pages = ref([
      'http://example.com/image1.jpg',
      'http://example.com/image2.jpg',
    ]);
    const currentPage = ref(0);

    const { preloadImages } = useImagePreload(pages, currentPage);

    const images: any[] = [];
    global.Image = vi.fn(() => {
      const img = { src: '' };
      images.push(img);
      return img;
    }) as unknown as typeof Image;

    preloadImages();

    // 只有 1 张后续图片，应该只预加载 1 张
    expect(images.length).toBe(1);
    expect(images[0].src).toBe('http://example.com/image2.jpg');
  });

  it('should handle empty pages array', () => {
    const pages = ref([]);
    const currentPage = ref(0);

    const { preloadImages } = useImagePreload(pages, currentPage);

    global.Image = vi.fn() as any;

    preloadImages();

    expect(global.Image).not.toHaveBeenCalled();
    expect(performanceMonitor.start).toHaveBeenCalled();
    expect(performanceMonitor.end).toHaveBeenCalled();
  });

  it('should log preloaded count', () => {
    const pages = ref([
      'http://example.com/image1.jpg',
      'http://example.com/image2.jpg',
      'http://example.com/image3.jpg',
    ]);
    const currentPage = ref(0);

    const { preloadImages } = useImagePreload(pages, currentPage);

    global.Image = vi.fn(() => ({ src: '' })) as unknown as typeof Image;

    preloadImages();

    expect(logger.debug).toHaveBeenCalledWith('Preloaded images', {
      count: 2,
      currentPage: 0,
    });
  });
});
