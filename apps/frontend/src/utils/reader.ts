import { ReadingMode } from '@read-comics/types';

// 辅助函数：映射 store 模式到枚举
export const mapReadingMode = (mode: string): ReadingMode => {
  switch (mode) {
    case 'double':
      return ReadingMode.DOUBLE_PAGE;
    case 'scroll':
      return ReadingMode.CONTINUOUS_SCROLL;
    default:
      return ReadingMode.SINGLE_PAGE;
  }
};

// 检测设备类型
export const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
