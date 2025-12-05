import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFileUpload } from '../useFileUpload';

// Mock toast
vi.mock('@/composables/useToast', () => ({
  toast: {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { toast } from '@/composables/useToast';

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle valid CBZ file selection', () => {
    const { handleFileSelect } = useFileUpload();

    const mockFile = new File(['test content'], 'test.cbz', {
      type: 'application/zip',
    });

    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;

    const result = handleFileSelect(mockEvent);

    expect(result).toBe(mockFile);
    expect(result?.name).toBe('test.cbz');
  });

  it('should handle valid ZIP file selection', () => {
    const { handleFileSelect } = useFileUpload();

    const mockFile = new File(['test content'], 'test.zip', {
      type: 'application/zip',
    });

    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;

    const result = handleFileSelect(mockEvent);

    expect(result).toBe(mockFile);
  });

  it('should reject invalid file types', () => {
    const { handleFileSelect } = useFileUpload();

    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;

    const result = handleFileSelect(mockEvent);

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      '不支持的文件格式。仅支持: .cbz, .zip',
    );
  });

  it('should handle no file selected', () => {
    const { handleFileSelect } = useFileUpload();

    const mockEvent = {
      target: {
        files: [],
      },
    } as any;

    const result = handleFileSelect(mockEvent);

    expect(result).toBeNull();
  });

  it('should provide fileInputRef', () => {
    const { fileInputRef } = useFileUpload();

    expect(fileInputRef).toBeDefined();
    expect(fileInputRef.value).toBeNull();
  });

  it('should validate file extension case-insensitively', () => {
    const { handleFileSelect } = useFileUpload();

    const mockFile = new File(['test content'], 'test.CBZ', {
      type: 'application/zip',
    });

    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;

    const result = handleFileSelect(mockEvent);

    expect(result).toBe(mockFile);
  });
});
