import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

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

export const useSettingsStore = defineStore('settings', () => {
  // 从 localStorage 初始化状态
  const savedSettings = localStorage.getItem('appSettings');
  const initialSettings = savedSettings
    ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }
    : DEFAULT_SETTINGS;

  const readingMode = ref<AppSettings['readingMode']>(
    initialSettings.readingMode,
  );
  const readingDirection = ref<AppSettings['readingDirection']>(
    initialSettings.readingDirection,
  );
  const zoomMode = ref<AppSettings['zoomMode']>(initialSettings.zoomMode);
  const fontSize = ref<AppSettings['fontSize']>(initialSettings.fontSize);
  const autoUpdate = ref<boolean>(initialSettings.autoUpdate);
  const comicStoragePath = ref<string>(initialSettings.comicStoragePath);

  // 更新设置的方法
  const updateSettings = (partialSettings: Partial<AppSettings>) => {
    if (partialSettings.readingMode)
      readingMode.value = partialSettings.readingMode;
    if (partialSettings.readingDirection)
      readingDirection.value = partialSettings.readingDirection;
    if (partialSettings.zoomMode) zoomMode.value = partialSettings.zoomMode;
    if (partialSettings.fontSize) fontSize.value = partialSettings.fontSize;
    if (partialSettings.autoUpdate !== undefined)
      autoUpdate.value = partialSettings.autoUpdate;
    if (partialSettings.comicStoragePath)
      comicStoragePath.value = partialSettings.comicStoragePath;
  };

  // 重置设置
  const resetSettings = () => {
    readingMode.value = DEFAULT_SETTINGS.readingMode;
    readingDirection.value = DEFAULT_SETTINGS.readingDirection;
    zoomMode.value = DEFAULT_SETTINGS.zoomMode;
    fontSize.value = DEFAULT_SETTINGS.fontSize;
    autoUpdate.value = DEFAULT_SETTINGS.autoUpdate;
    comicStoragePath.value = DEFAULT_SETTINGS.comicStoragePath;
  };

  // 监听状态变化并保存到 localStorage
  watch(
    [
      readingMode,
      readingDirection,
      zoomMode,
      fontSize,
      autoUpdate,
      comicStoragePath,
    ],
    () => {
      const settings: AppSettings = {
        readingMode: readingMode.value,
        readingDirection: readingDirection.value,
        zoomMode: zoomMode.value,
        fontSize: fontSize.value,
        autoUpdate: autoUpdate.value,
        comicStoragePath: comicStoragePath.value,
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
    },
  );

  return {
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
