import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useReaderStore } from '../reader';
import type { Comic } from '@read-comics/types';
import { ComicStatus, ComicFormat } from '@read-comics/types';

// Mock comic data for testing
const mockComic: Comic = {
  id: 'comic-1',
  title: 'Test Comic',
  description: 'A test comic for unit testing',
  author: 'Test Author',
  filePath: '/test/comic.cbz',
  fileSize: 1024000,
  fileFormat: ComicFormat.CBZ,
  totalPages: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: ComicStatus.UNREAD,
};

describe('Reader Store', () => {
  beforeEach(() => {
    // Create a new pinia instance for each test
    setActivePinia(createPinia());
  });

  describe('State', () => {
    it('should initialize with default state', () => {
      const store = useReaderStore();
      expect(store.currentComic).toBeNull();
      expect(store.currentChapterId).toBeNull();
      expect(store.currentPage).toBe(0);
      expect(store.totalPages).toBe(0);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.readingProgress).toEqual({});
    });
  });

  describe('Getters', () => {
    it('should return current page', () => {
      const store = useReaderStore();
      store.currentPage = 5;
      expect(store.getCurrentPage).toBe(5);
    });

    it('should return total pages', () => {
      const store = useReaderStore();
      store.totalPages = 20;
      expect(store.getTotalPages).toBe(20);
    });

    it('should calculate progress percentage', () => {
      const store = useReaderStore();
      store.currentComic = mockComic;
      store.currentChapterId = 'chapter-1';
      store.currentPage = 5;
      store.totalPages = 10;

      // Manually set the reading progress to match the currentPage
      store.readingProgress[mockComic.id] = {
        'chapter-1': {
          currentPage: 5,
          lastReadAt: new Date(),
        },
      };

      expect(store.getProgress).toBe(50);
    });

    it('should return 0 progress when no comic or chapter is loaded', () => {
      const store = useReaderStore();
      expect(store.getProgress).toBe(0);
    });

    it('should return true when there is a next page', () => {
      const store = useReaderStore();
      store.currentPage = 5;
      store.totalPages = 10;
      expect(store.hasNextPage).toBe(true);
    });

    it('should return false when there is no next page', () => {
      const store = useReaderStore();
      store.currentPage = 9;
      store.totalPages = 10;
      expect(store.hasNextPage).toBe(false);
    });

    it('should return true when there is a previous page', () => {
      const store = useReaderStore();
      store.currentPage = 5;
      store.totalPages = 10;
      expect(store.hasPreviousPage).toBe(true);
    });

    it('should return false when there is no previous page', () => {
      const store = useReaderStore();
      store.currentPage = 0;
      store.totalPages = 10;
      expect(store.hasPreviousPage).toBe(false);
    });

    it('should return loading state', () => {
      const store = useReaderStore();
      expect(store.isLoading).toBe(false);

      store.loading = true;
      expect(store.isLoading).toBe(true);
    });

    it('should return error state', () => {
      const store = useReaderStore();
      expect(store.hasError).toBe(false);

      store.error = 'Test error';
      expect(store.hasError).toBe(true);
    });

    it('should return error message', () => {
      const store = useReaderStore();
      store.error = 'Test error';
      expect(store.getError).toBe('Test error');
    });

    it('should return reading progress for specific comic and chapter', () => {
      const store = useReaderStore();
      const progress = {
        currentPage: 3,
        lastReadAt: new Date(),
      };

      store.readingProgress = {
        'comic-1': {
          'chapter-1': progress,
        },
      };

      expect(store.getReadingProgress('comic-1', 'chapter-1')).toEqual(
        progress,
      );
      expect(store.getReadingProgress('comic-1', 'non-existent')).toBeNull();
    });

    it('should return all progress for a specific comic', () => {
      const store = useReaderStore();
      const comicProgress = {
        'chapter-1': {
          currentPage: 3,
          lastReadAt: new Date(),
        },
        'chapter-2': {
          currentPage: 5,
          lastReadAt: new Date(),
        },
      };

      store.readingProgress = {
        'comic-1': comicProgress,
      };

      expect(store.getComicProgress('comic-1')).toEqual(comicProgress);
      expect(store.getComicProgress('non-existent')).toEqual({});
    });
  });

  describe('Actions', () => {
    it('should load chapter successfully', async () => {
      const store = useReaderStore();

      await store.loadChapter(mockComic, 'chapter-1', 2);

      expect(store.currentComic).toEqual(mockComic);
      expect(store.currentChapterId).toBe('chapter-1');
      expect(store.currentPage).toBe(2);
      expect(store.totalPages).toBe(10);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();

      // Check reading progress was initialized
      expect(store.readingProgress['comic-1']['chapter-1']).toEqual({
        currentPage: 2,
        lastReadAt: expect.any(Date),
      });
    });

    it('should handle error when loading chapter', async () => {
      const store = useReaderStore();

      // Set a mock error
      (global as any).__mockError = new Error('Network error');

      await store.loadChapter(mockComic, 'chapter-1', 2);

      expect(store.loading).toBe(false);
      expect(store.error).toBe('Network error');
      expect(store.currentComic).toBeNull();
    });

    it('should go to next page when available', () => {
      const store = useReaderStore();
      store.totalPages = 10;
      store.currentPage = 5;

      store.nextPage();

      expect(store.currentPage).toBe(6);
    });

    it('should not go to next page when not available', () => {
      const store = useReaderStore();
      store.totalPages = 10;
      store.currentPage = 9;

      store.nextPage();

      expect(store.currentPage).toBe(9);
    });

    it('should go to previous page when available', () => {
      const store = useReaderStore();
      store.currentPage = 5;

      store.previousPage();

      expect(store.currentPage).toBe(4);
    });

    it('should not go to previous page when not available', () => {
      const store = useReaderStore();
      store.currentPage = 0;

      store.previousPage();

      expect(store.currentPage).toBe(0);
    });

    it('should go to specified page within bounds', () => {
      const store = useReaderStore();
      store.totalPages = 10;

      store.goToPage(5);

      expect(store.currentPage).toBe(5);
    });

    it('should not go to page outside bounds', () => {
      const store = useReaderStore();
      store.totalPages = 10;
      store.currentPage = 0;

      store.goToPage(-1);
      expect(store.currentPage).toBe(0);

      store.goToPage(10);
      expect(store.currentPage).toBe(0);
    });

    it('should update reading progress', () => {
      const store = useReaderStore();
      store.currentComic = mockComic;
      store.currentChapterId = 'chapter-1';
      store.currentPage = 3;

      store.updateProgress();

      expect(store.readingProgress['comic-1']['chapter-1']).toEqual({
        currentPage: 3,
        lastReadAt: expect.any(Date),
      });
    });

    it('should clear progress', () => {
      const store = useReaderStore();
      store.currentPage = 5;
      store.totalPages = 10;
      store.currentComic = mockComic;
      store.currentChapterId = 'chapter-1';

      store.clearProgress();

      expect(store.currentPage).toBe(0);
      expect(store.totalPages).toBe(0);
      expect(store.currentComic).toBeNull();
      expect(store.currentChapterId).toBeNull();
    });

    it('should clear error', () => {
      const store = useReaderStore();
      store.error = 'Test error';

      store.clearError();

      expect(store.error).toBeNull();
    });

    it('should clear all state', () => {
      const store = useReaderStore();
      store.currentPage = 5;
      store.totalPages = 10;
      store.currentComic = mockComic;
      store.currentChapterId = 'chapter-1';
      store.loading = true;
      store.error = 'Test error';
      store.readingProgress = {
        'comic-1': {
          'chapter-1': {
            currentPage: 3,
            lastReadAt: new Date(),
          },
        },
      };

      store.clear();

      expect(store.currentComic).toBeNull();
      expect(store.currentChapterId).toBeNull();
      expect(store.currentPage).toBe(0);
      expect(store.totalPages).toBe(0);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.readingProgress).toEqual({});
    });
  });
});
