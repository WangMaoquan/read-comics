import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFavorite } from '../useFavorite';
import { useComicStore } from '@/stores/comic';
import type { Comic } from '@read-comics/types';
import { ComicFormat, ComicStatus } from '@read-comics/types';

// Mock API services
vi.mock('@/api/services', () => ({
  comicsService: {
    toggleFavorite: vi.fn(),
  },
}));

// Mock error handler
vi.mock('@/utils/errorHandler', () => ({
  handleError: vi.fn(),
}));

import { comicsService } from '@/api/services';
import { handleError } from '@/utils/errorHandler';

describe('useFavorite', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should toggle favorite status successfully', async () => {
    const { toggleFavorite } = useFavorite();
    const comicStore = useComicStore();

    const mockComic: Comic = {
      id: '1',
      title: 'Test Comic',
      isFavorite: false,
      filePath: '/test/path',
      fileSize: 1000,
      fileFormat: ComicFormat.CBZ,
      totalPages: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ComicStatus.UNREAD,
    };

    const updatedComic: Comic = {
      ...mockComic,
      isFavorite: true,
    };

    // Mock API response
    vi.mocked(comicsService.toggleFavorite).mockResolvedValueOnce(updatedComic);

    // Set initial state
    comicStore.currentComic = mockComic;
    comicStore.comics = [mockComic];

    // Call toggleFavorite
    await toggleFavorite(mockComic);

    // Verify API was called
    expect(comicsService.toggleFavorite).toHaveBeenCalledWith('1');

    // Verify store was updated
    expect(comicStore.currentComic?.isFavorite).toBe(true);
    expect(comicStore.comics[0].isFavorite).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const { toggleFavorite } = useFavorite();

    const mockComic: Comic = {
      id: '1',
      title: 'Test Comic',
      isFavorite: false,
      filePath: '/test/path',
      fileSize: 1000,
      fileFormat: ComicFormat.CBZ,
      totalPages: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ComicStatus.UNREAD,
    };

    // Mock API error
    const error = new Error('Network error');
    vi.mocked(comicsService.toggleFavorite).mockRejectedValueOnce(error);

    // Call toggleFavorite
    await toggleFavorite(mockComic);

    // Verify error handler was called
    expect(handleError).toHaveBeenCalledWith(
      error,
      'Failed to toggle favorite',
    );
  });

  it('should update comics list if comic exists', async () => {
    const { toggleFavorite } = useFavorite();
    const comicStore = useComicStore();

    const mockComic: Comic = {
      id: '1',
      title: 'Test Comic',
      isFavorite: false,
      filePath: '/test/path',
      fileSize: 1000,
      fileFormat: ComicFormat.CBZ,
      totalPages: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ComicStatus.UNREAD,
    };

    const updatedComic: Comic = {
      ...mockComic,
      isFavorite: true,
    };

    vi.mocked(comicsService.toggleFavorite).mockResolvedValueOnce(updatedComic);

    // Set comics list
    comicStore.comics = [mockComic];

    await toggleFavorite(mockComic);

    // Verify comics list was updated
    expect(comicStore.comics[0].isFavorite).toBe(true);
  });

  it('should not fail if comic is not in comics list', async () => {
    const { toggleFavorite } = useFavorite();
    const comicStore = useComicStore();

    const mockComic: Comic = {
      id: '1',
      title: 'Test Comic',
      isFavorite: false,
      filePath: '/test/path',
      fileSize: 1000,
      fileFormat: ComicFormat.CBZ,
      totalPages: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ComicStatus.UNREAD,
    };

    const updatedComic: Comic = {
      ...mockComic,
      isFavorite: true,
    };

    vi.mocked(comicsService.toggleFavorite).mockResolvedValueOnce(updatedComic);

    // Set current comic but not in comics list
    comicStore.currentComic = mockComic;
    comicStore.comics = [];

    await toggleFavorite(mockComic);

    // Should not throw error
    expect(comicStore.currentComic?.isFavorite).toBe(true);
  });
});
