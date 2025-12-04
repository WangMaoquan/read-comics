export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
    logout: '/auth/logout',
  },
  comics: {
    list: '/comics',
    detail: (id: string) => `/comics/${id}`,
    chapters: (id: string) => `/chapters?comicId=${id}`,
    progress: (id: string) => `/comics/${id}/progress`,
    progressAll: (id: string) => `/comics/${id}/progress/all`,
    progressChapter: (id: string, chapterId: string) =>
      `/comics/${id}/progress/chapter/${chapterId}`,
    toggleFavorite: (id: string) => `/comics/${id}/favorite`,
  },
  chapters: {
    detail: (id: string) => `/chapters/${id}`,
  },
  tags: {
    base: '/tags',
    list: '/tags',
    detail: (id: string) => `/tags/${id}`,
    update: (id: string) => `/tags/${id}`,
    delete: (id: string) => `/tags/${id}`,
    comics: (id: string) => `/tags/${id}/comics`,
    addToComic: (comicId: string, tagId: string) =>
      `/comics/${comicId}/tags/${tagId}`,
    removeFromComic: (comicId: string, tagId: string) =>
      `/comics/${comicId}/tags/${tagId}`,
  },
  favorites: {
    base: '/favorites',
    check: (comicId: string) => `/favorites/check/${comicId}`,
    update: (comicId: string) => `/favorites/${comicId}`,
    remove: (comicId: string) => `/favorites/${comicId}`,
    stats: '/favorites/stats',
  },
  files: {
    upload: '/files/upload',
    scan: '/files/scan',
    formats: '/files/formats',
  },
  images: {
    view: '/images/view',
    thumbnail: '/images/thumbnail',
    formats: '/images/formats',
  },
  stats: {
    overview: '/stats/overview',
    comicsTrend: '/stats/comics-trend',
    topComics: '/stats/top-comics',
    storage: '/stats/storage',
    userActivity: '/stats/user-activity',
  },
  logs: {
    list: '/logs',
    stats: '/logs/stats',
    clear: '/logs',
  },
  tasks: {
    list: '/tasks',
    stats: '/tasks/stats',
    create: '/tasks',
    cancel: (id: string) => `/tasks/${id}/cancel`,
    retry: (id: string) => `/tasks/${id}/retry`,
    delete: (id: string) => `/tasks/${id}`,
    clearCompleted: '/tasks/completed',
  },
  backups: {
    list: '/backups',
    stats: '/backups/stats',
    create: '/backups',
    delete: (id: string) => `/backups/${id}`,
    restore: (id: string) => `/backups/${id}/restore`,
  },
};
