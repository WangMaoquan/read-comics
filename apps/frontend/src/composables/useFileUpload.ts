import { ref } from 'vue';
import { validateFile } from '@/utils/formatValidation';
import { toast } from '@/composables/useToast';
import { logger } from '@/utils/logger';

/**
 * 文件上传 Composable
 * 统一的文件选择、验证和上传逻辑
 */
export function useFileUpload() {
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const selectedFile = ref<File | null>(null);
  const isUploading = ref(false);

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.value?.click();
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: Event): File | null => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return null;
    }

    // 使用统一的文件验证工具
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || '文件验证失败');
      target.value = ''; // 重置 input
      logger.warn('File validation failed', {
        fileName: file.name,
        error: validation.error,
      });
      return null;
    }

    selectedFile.value = file;
    logger.debug('File selected', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // 重置 input，以便下次可以选择相同文件
    target.value = '';

    return file;
  };

  /**
   * 清除选中的文件
   */
  const clearSelectedFile = () => {
    selectedFile.value = null;
  };

  /**
   * 重置文件输入
   */
  const resetFileInput = () => {
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    selectedFile.value = null;
  };

  return {
    fileInputRef,
    selectedFile,
    isUploading,
    triggerFileSelect,
    handleFileSelect,
    clearSelectedFile,
    resetFileInput,
  };
}
