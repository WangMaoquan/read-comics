import { defineStore } from 'pinia';
import type { Comic } from '@read-comics/types';
import { ComicStatus, ComicFormat } from '@read-comics/types';

interface ComicState {
  comics: Comic[];
  loading: boolean;
  error: string | null;
  currentComic: Comic | null;
}

export const useComicStore = defineStore('comic', {
  state: (): ComicState => ({
    comics: [],
    loading: false,
    error: null,
    currentComic: null,
  }),

  getters: {
    getComicById: (state) => (id: string) => {
      return state.comics.find((comic) => comic.id === id);
    },

    getComicsCount: (state) => {
      return state.comics.length;
    },

    isLoading: (state) => {
      return state.loading;
    },

    hasError: (state) => {
      return state.error !== null;
    },

    getError: (state) => {
      return state.error;
    },
  },

  actions: {
    async fetchComics() {
      this.loading = true;
      this.error = null;

      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockComics: Comic[] = [
          {
            id: '1',
            title: '进击的巨人',
            author: '谏山创',
            description: '人类与巨人的生存之战',
            coverPath: '',
            filePath: '/comics/attack-on-titan',
            fileSize: 1000000,
            fileFormat: ComicFormat.CBZ,
            totalPages: 139,
            createdAt: new Date('2013-09-09'),
            updatedAt: new Date('2021-04-09'),
            status: ComicStatus.COMPLETED,
          },
          {
            id: '2',
            title: '海贼王',
            author: '尾田荣一郎',
            description: '路飞成为海贼王的冒险故事',
            coverPath: '',
            filePath: '/comics/one-piece',
            fileSize: 2000000,
            fileFormat: ComicFormat.CBZ,
            totalPages: 1000,
            createdAt: new Date('1997-07-22'),
            updatedAt: new Date('2024-01-01'),
            status: ComicStatus.READING,
          },
          {
            id: '3',
            title: '火影忍者',
            author: '岸本齐史',
            description: '鸣人成为火影的成长之路',
            coverPath: '',
            filePath: '/comics/naruto',
            fileSize: 1500000,
            fileFormat: ComicFormat.CBZ,
            totalPages: 700,
            createdAt: new Date('1999-09-21'),
            updatedAt: new Date('2014-11-10'),
            status: ComicStatus.COMPLETED,
          },
        ];

        this.comics = mockComics;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch comics';
        console.error('Error fetching comics:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchComicById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data
        const mockComic: Comic = {
          id,
          title: '漫画标题',
          author: '作者名',
          description: '这是一个精彩的漫画故事',
          coverPath: '',
          filePath: `/comics/${id}`,
          fileSize: 500000,
          fileFormat: ComicFormat.CBZ,
          totalPages: 50,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2024-01-01'),
          status: ComicStatus.READING,
        };

        this.currentComic = mockComic;
        return mockComic;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch comic';
        console.error('Error fetching comic:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    addComic(comic: Comic) {
      this.comics.unshift(comic);
    },

    updateComic(id: string, updates: Omit<Partial<Comic>, 'id'>) {
      const index = this.comics.findIndex((comic) => comic.id === id);
      if (index !== -1) {
        this.comics[index] = { ...this.comics[index], ...updates } as Comic;
      }
    },

    removeComic(id: string) {
      this.comics = this.comics.filter((comic) => comic.id !== id);
    },

    setCurrentComic(comic: Comic | null) {
      this.currentComic = comic;
    },

    clearError() {
      this.error = null;
    },

    clear() {
      this.comics = [];
      this.currentComic = null;
      this.error = null;
      this.loading = false;
    },
  },
});
