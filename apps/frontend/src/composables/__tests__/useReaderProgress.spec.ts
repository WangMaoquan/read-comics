import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useReaderProgress } from '../useReaderProgress';

// Mock API
vi.mock('@/api/services', () => ({
  comicsService: {
    updateProgress: vi.fn(),
    getChapterProgress: vi.fn(),
  },
}));

// Mock performance monitor
vi.mock('@/utils/performance', () => ({
  performanceMonitor: {
    measure: vi.fn((_name, fn) => fn()),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { comicsService } from '@/api/services';

describe('useReaderProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should save progress with debounce', async () => {
    const comicId = ref('comic-1');
    const chapterId = ref('chapter-1');
    const currentPage = ref(5);
    const totalPages = ref(10);
    const readingMode = ref('single' as any);

    vi.mocked(comicsService.updateProgress).mockResolvedValueOnce({
      id: '1',
      comicId: 'comic-1',
      chapterId: 'chapter-1',
      currentPage: 5,
      totalPages: 10,
      progress: 50,
      lastReadAt: new Date(),
      isReadComplete: false,
    });

    const { saveProgress } = useReaderProgress(
      comicId,
      chapterId,
      currentPage,
      totalPages,
      readingMode,
    );

    // 调用 saveProgress
    saveProgress();

    // 等待防抖时间
    await vi.advanceTimersByTimeAsync(600);

    // 验证 API 被调用
    expect(comicsService.updateProgress).toHaveBeenCalledWith('comic-1', {
      chapterId: 'chapter-1',
      currentPage: 5,
      totalPages: 10,
    });
  });

  it('should restore progress from server if localStorage is empty', async () => {
    const comicId = ref('comic-1');
    const chapterId = ref('chapter-1');
    const currentPage = ref(0);
    const totalPages = ref(10);
    const readingMode = ref('single' as any);

    vi.mocked(comicsService.getChapterProgress).mockResolvedValueOnce({
      id: '1',
      comicId: 'comic-1',
      chapterId: 'chapter-1',
      currentPage: 7,
      totalPages: 10,
      progress: 70,
      lastReadAt: new Date(),
      isReadComplete: false,
    });

    const { restoreProgress } = useReaderProgress(
      comicId,
      chapterId,
      currentPage,
      totalPages,
      readingMode,
    );

    const setCurrentPage = vi.fn();
    await restoreProgress(setCurrentPage);

    expect(setCurrentPage).toHaveBeenCalledWith(7);
  });

  it('should default to page 0 if no progress found', async () => {
    const comicId = ref('comic-1');
    const chapterId = ref('chapter-1');
    const currentPage = ref(0);
    const totalPages = ref(10);
    const readingMode = ref('single' as any);

    vi.mocked(comicsService.getChapterProgress).mockResolvedValueOnce(
      undefined as any,
    );

    const { restoreProgress } = useReaderProgress(
      comicId,
      chapterId,
      currentPage,
      totalPages,
      readingMode,
    );

    const setCurrentPage = vi.fn();
    await restoreProgress(setCurrentPage);

    expect(setCurrentPage).toHaveBeenCalledWith(0);
  });
});
