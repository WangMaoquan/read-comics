import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { STORAGE_KEYS } from '../config';

export interface AppSettings {
  readingMode: 'single' | 'double' | 'scroll';
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  zoomMode: 'fit' | 'width' | 'original';
  fontSize: 'small' | 'medium' | 'large';
  autoUpdate: boolean;
  comicStoragePath: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  readingMode: 'single',
  readingDirection: 'ltr',
  zoomMode: 'fit',
  fontSize: 'medium',
  autoUpdate: false,
  comicStoragePath: 'C:/Comics',
};

import { logger } from '../utils/logger';

export const useSettingsStore = defineStore('settings', () => {
  // 迁移逻辑：检查旧 key 是否存在
  if (localStorage.getItem('appSettings')) {
    try {
      const oldSettings = JSON.parse(
        localStorage.getItem('appSettings') || '{}',
      );
      if (oldSettings && Object.keys(oldSettings).length > 0) {
        // 将旧数据写入新 key (useStorage 会读取这个新 key)
        localStorage.setItem(
          STORAGE_KEYS.APP_SETTINGS,
          JSON.stringify({
            ...DEFAULT_SETTINGS,
            ...oldSettings,
          }),
        );
        // 删除旧 key
        localStorage.removeItem('appSettings');
      }
    } catch (e) {
      logger.error('Failed to migrate settings', e);
    }
  }

  // 使用 useStorage 自动管理持久化
  // mergeDefaults: true 确保新增加的设置项会有默认值
  const settings = useStorage<AppSettings>(
    STORAGE_KEYS.APP_SETTINGS,
    DEFAULT_SETTINGS,
    localStorage,
    { mergeDefaults: true },
  );

  // 为了保持 API 兼容性，使用 computed 暴露各个属性
  // 这样修改这些属性会自动更新 settings 对象，进而触发 useStorage 的保存
  const readingMode = computed({
    get: () => settings.value.readingMode,
    set: (val) => (settings.value.readingMode = val),
  });

  const readingDirection = computed({
    get: () => settings.value.readingDirection,
    set: (val) => (settings.value.readingDirection = val),
  });

  const zoomMode = computed({
    get: () => settings.value.zoomMode,
    set: (val) => (settings.value.zoomMode = val),
  });

  const fontSize = computed({
    get: () => settings.value.fontSize,
    set: (val) => (settings.value.fontSize = val),
  });

  const autoUpdate = computed({
    get: () => settings.value.autoUpdate,
    set: (val) => (settings.value.autoUpdate = val),
  });

  const comicStoragePath = computed({
    get: () => settings.value.comicStoragePath,
    set: (val) => (settings.value.comicStoragePath = val),
  });

  // 更新设置的方法
  const updateSettings = (partialSettings: Partial<AppSettings>) => {
    settings.value = {
      ...settings.value,
      ...partialSettings,
    };
  };

  // 重置设置
  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS };
  };

  return {
    settings, // 暴露整个对象以备后用
    readingMode,
    readingDirection,
    zoomMode,
    fontSize,
    autoUpdate,
    comicStoragePath,
    updateSettings,
    resetSettings,
  };
});
