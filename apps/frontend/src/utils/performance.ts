import { IS_DEVELOPMENT } from '../config';
import { logger } from './logger';

/**
 * 性能指标
 */
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers = new Map<string, number>();
  private maxMetrics = 1000;

  /**
   * 开始计时
   */
  start(name: string, metadata?: Record<string, any>): void {
    this.timers.set(name, performance.now());
    if (metadata) {
      this.timers.set(`${name}_metadata`, metadata as any);
    }
  }

  /**
   * 结束计时并记录
   */
  end(name: string): number | null {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Performance timer "${name}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metadata = this.timers.get(`${name}_metadata`) as
      | Record<string, any>
      | undefined;

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 清理计时器
    this.timers.delete(name);
    this.timers.delete(`${name}_metadata`);

    // 开发环境输出
    if (IS_DEVELOPMENT) {
      console.log(
        `⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`,
        metadata,
      );
    }

    // 如果耗时过长,记录警告
    if (duration > 1000) {
      logger.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
        metadata,
      );
    }

    return duration;
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取指定名称的指标
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * 获取平均耗时
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * 获取统计信息
   */
  getStats(name?: string) {
    const metrics = name ? this.getMetricsByName(name) : this.metrics;

    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        total: 0,
      };
    }

    const durations = metrics.map((m) => m.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);

    return {
      count: metrics.length,
      average: total / metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      total,
    };
  }

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * 导出指标
   */
  export(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        stats: this.getStats(),
      },
      null,
      2,
    );
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能装饰器
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(metricName, () =>
        originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}

/**
 * 监控页面加载性能
 */
export function monitorPageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;

    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom:
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart,
      };

      logger.info('Page load performance', metrics);

      if (IS_DEVELOPMENT) {
        console.table(metrics);
      }
    }
  });
}

// 自动监控页面加载
monitorPageLoad();
