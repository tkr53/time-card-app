import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClockButton } from '../ClockButton';
import type { ClockType, ClockStatus } from '@/types';

// タイマーをモック化
jest.useFakeTimers();

describe('ClockButton', () => {
  const mockOnClock = jest.fn();

  beforeEach(() => {
    mockOnClock.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Clock In Button', () => {
    it('should render clock-in button correctly when not clocked in', () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('出勤');
      expect(button).toHaveTextContent('🏢');
      expect(button).not.toBeDisabled();
      expect(button).toHaveClass('bg-blue-500');
    });

    it('should be disabled when already clocked in', () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-gray-400');
    });

    it('should call onClock when clicked', async () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClock).toHaveBeenCalledWith('clock-in');
      expect(mockOnClock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Clock Out Button', () => {
    it('should render clock-out button correctly when clocked in', () => {
      render(
        <ClockButton 
          type="clock-out" 
          status="clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('退勤');
      expect(button).toHaveTextContent('🏠');
      expect(button).not.toBeDisabled();
      expect(button).toHaveClass('bg-green-500');
    });

    it('should be disabled when not clocked in', () => {
      render(
        <ClockButton 
          type="clock-out" 
          status="not-clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-gray-400');
    });

    it('should be disabled when already clocked out', () => {
      render(
        <ClockButton 
          type="clock-out" 
          status="clocked-out" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should call onClock when clicked', async () => {
      render(
        <ClockButton 
          type="clock-out" 
          status="clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClock).toHaveBeenCalledWith('clock-out');
      expect(mockOnClock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should show loading state when processing', async () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 処理中のテキストが表示される
      expect(screen.getByText('処理中...')).toBeInTheDocument();
      
      // ローディングスピナーが表示される
      expect(screen.getByRole('button')).toHaveClass('opacity-70');

      // 300ms後にローディング状態が解除される
      jest.useFakeTimers();
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.queryByText('処理中...')).not.toBeInTheDocument();
      });
    });

    it('should not allow multiple clicks during loading', () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock} 
        />
      );

      const button = screen.getByRole('button');
      
      // 連続でクリック
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // onClockは1回だけ呼ばれる
      expect(mockOnClock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props', () => {
    it('should respect disabled prop', () => {
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(mockOnClock).not.toHaveBeenCalled();
    });

    it('should apply custom className', () => {
      const customClass = 'custom-button-class';
      render(
        <ClockButton 
          type="clock-in" 
          status="not-clocked-in" 
          onClock={mockOnClock}
          className={customClass}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(customClass);
    });
  });

  describe('Button States', () => {
    const statuses: ClockStatus[] = ['not-clocked-in', 'clocked-in', 'clocked-out'];
    const types: ClockType[] = ['clock-in', 'clock-out'];

    types.forEach(type => {
      statuses.forEach(status => {
        it(`should handle ${type} button with ${status} status correctly`, () => {
          render(
            <ClockButton 
              type={type} 
              status={status} 
              onClock={mockOnClock} 
            />
          );

          const button = screen.getByRole('button');
          
          // 期待される無効状態をチェック
          const expectedDisabled = 
            (type === 'clock-in' && status === 'clocked-in') ||
            (type === 'clock-out' && status !== 'clocked-in');

          if (expectedDisabled) {
            expect(button).toBeDisabled();
          } else {
            expect(button).not.toBeDisabled();
          }
        });
      });
    });
  });
});
