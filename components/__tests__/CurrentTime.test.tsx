import { render, screen, act } from '@testing-library/react';
import { CurrentTime } from '../CurrentTime';

// setIntervalとclearIntervalをモック化
jest.useFakeTimers();

describe('CurrentTime', () => {
  beforeEach(() => {
    // 固定の日時を設定（2025年5月27日 09:30:00）
    const mockDate = new Date('2025-05-27T09:30:00');
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should display current time correctly', () => {
    render(<CurrentTime />);
    
    // 時刻の表示を確認
    expect(screen.getByText('09:30')).toBeInTheDocument();
    
    // 日付の表示を確認（日本語形式）
    expect(screen.getByText(/2025年5月27日/)).toBeInTheDocument();
    expect(screen.getByText(/火曜日/)).toBeInTheDocument();
  });

  it('should update time every second', () => {
    render(<CurrentTime />);
    
    // 初期時刻を確認
    expect(screen.getByText('09:30')).toBeInTheDocument();
    
    // 1分進める
    act(() => {
      jest.setSystemTime(new Date('2025-05-27T09:31:00'));
      jest.advanceTimersByTime(1000);
    });
    
    // 時刻が更新されることを確認
    expect(screen.getByText('09:31')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-time-class';
    render(<CurrentTime className={customClass} />);
    
    const container = screen.getByText('09:30').closest('div')?.parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('should handle hour format correctly', () => {
    // 一桁の時間をテスト
    jest.setSystemTime(new Date('2025-05-27T05:07:00'));
    
    render(<CurrentTime />);
    
    // ゼロパディングされていることを確認
    expect(screen.getByText('05:07')).toBeInTheDocument();
  });

  it('should handle midnight correctly', () => {
    // 00:00をテスト
    jest.setSystemTime(new Date('2025-05-27T00:00:00'));
    
    render(<CurrentTime />);
    
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('should handle 23:59 correctly', () => {
    // 23:59をテスト
    jest.setSystemTime(new Date('2025-05-27T23:59:00'));
    
    render(<CurrentTime />);
    
    expect(screen.getByText('23:59')).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(<CurrentTime />);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
});
