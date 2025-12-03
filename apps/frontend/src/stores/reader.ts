import { defineStore } from 'pinia';
import type { Comic } from '@read-comics/types';

interface ReaderState {
  currentComic: Comic | null;
  currentChapterId: string | null;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  readingProgress: {
    [comicId: string]: {
      [chapterId: string]: {
        currentPage: number;
        lastReadAt: Date;
      };
    };
  };
}

import { logger } from '../utils/logger';

export const useReaderStore = defineStore('reader', {
  state: (): ReaderState => ({
    currentComic: null,
    currentChapterId: null,
    currentPage: 0,
    totalPages: 0,
    loading: false,
    error: null,
    readingProgress: {},
  }),

  getters: {
    getCurrentPage: (state) => state.currentPage,

    getTotalPages: (state) => state.totalPages,

    getProgress: (state) => {
      if (!state.currentComic || !state.currentChapterId) return 0;
      const chapterProgress =
        state.readingProgress[state.currentComic.id]?.[state.currentChapterId];
      if (!chapterProgress) return 0;
      return Math.round((chapterProgress.currentPage / state.totalPages) * 100);
    },

    hasNextPage: (state) => state.currentPage < state.totalPages - 1,

    hasPreviousPage: (state) => state.currentPage > 0,

    isLoading: (state) => state.loading,

    hasError: (state) => state.error !== null,

    getError: (state) => state.error,

    getReadingProgress: (state) => (comicId: string, chapterId: string) => {
      return state.readingProgress[comicId]?.[chapterId] || null;
    },

    getComicProgress: (state) => (comicId: string) => {
      return state.readingProgress[comicId] || {};
    },
  },

  actions: {
    async loadChapter(comic: Comic, chapterId: string, page: number = 0) {
      this.loading = true;
      this.error = null;

      try {
        // TODO: Replace with actual API call to load chapter
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.currentComic = comic;
        this.currentChapterId = chapterId;
        this.currentPage = page;
        this.totalPages = comic.totalPages;

        // Load or initialize reading progress
        if (!this.readingProgress[comic.id]) {
          this.readingProgress[comic.id] = {};
        }
        if (!this.readingProgress[comic.id]?.[chapterId]) {
          this.readingProgress[comic.id]![chapterId] = {
            currentPage: page,
            lastReadAt: new Date(),
          };
        } else {
          this.readingProgress[comic.id]![chapterId]!.currentPage = page;
          this.readingProgress[comic.id]![chapterId]!.lastReadAt = new Date();
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to load chapter';
        logger.error('Error loading chapter:', error);
      } finally {
        this.loading = false;
      }
    },

    nextPage() {
      if (this.hasNextPage) {
        this.currentPage++;
        this.updateProgress();
      }
    },

    previousPage() {
      if (this.hasPreviousPage) {
        this.currentPage--;
        this.updateProgress();
      }
    },

    goToPage(page: number) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
        this.updateProgress();
      }
    },

    updateProgress() {
      if (this.currentComic && this.currentChapterId) {
        if (!this.readingProgress[this.currentComic.id]) {
          this.readingProgress[this.currentComic.id] = {};
        }
        this.readingProgress[this.currentComic.id]![this.currentChapterId] = {
          currentPage: this.currentPage,
          lastReadAt: new Date(),
        };
      }
    },

    clearProgress() {
      this.currentPage = 0;
      this.totalPages = 0;
      this.currentComic = null;
      this.currentChapterId = null;
    },

    clearError() {
      this.error = null;
    },

    clear() {
      this.currentComic = null;
      this.currentChapterId = null;
      this.currentPage = 0;
      this.totalPages = 0;
      this.loading = false;
      this.error = null;
      this.readingProgress = {};
    },
  },
});
