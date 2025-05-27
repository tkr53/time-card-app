import {
  type TimeRecord,
  type ClockStatus,
  type TodayWorkStatus,
  type ClockType,
  type TimeCardData,
  type FormattedTime,
  type WorkStatistics,
} from '../index';

describe('Types', () => {
  describe('TimeRecord', () => {
    it('should allow valid TimeRecord object', () => {
      const timeRecord: TimeRecord = {
        id: 'test-id-123',
        date: '2025-05-27',
        clockIn: new Date('2025-05-27T09:00:00'),
        clockOut: new Date('2025-05-27T18:00:00'),
        workDuration: 480, // 8時間 = 480分
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(timeRecord.id).toBe('test-id-123');
      expect(timeRecord.date).toBe('2025-05-27');
      expect(timeRecord.workDuration).toBe(480);
    });

    it('should allow TimeRecord with only clockIn', () => {
      const timeRecord: TimeRecord = {
        id: 'test-id-456',
        date: '2025-05-27',
        clockIn: new Date('2025-05-27T09:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(timeRecord.clockOut).toBeUndefined();
      expect(timeRecord.workDuration).toBeUndefined();
    });
  });

  describe('ClockStatus', () => {
    it('should accept valid clock status values', () => {
      const statuses: ClockStatus[] = [
        'not-clocked-in',
        'clocked-in',
        'clocked-out'
      ];

      statuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });
  });

  describe('TodayWorkStatus', () => {
    it('should create valid work status for not clocked in', () => {
      const status: TodayWorkStatus = {
        status: 'not-clocked-in',
        workDuration: 0,
        date: '2025-05-27',
      };

      expect(status.status).toBe('not-clocked-in');
      expect(status.clockInTime).toBeUndefined();
      expect(status.workDuration).toBe(0);
    });

    it('should create valid work status for clocked in', () => {
      const clockInTime = new Date('2025-05-27T09:00:00');
      const status: TodayWorkStatus = {
        status: 'clocked-in',
        clockInTime,
        workDuration: 120, // 2時間経過
        date: '2025-05-27',
      };

      expect(status.status).toBe('clocked-in');
      expect(status.clockInTime).toBe(clockInTime);
      expect(status.clockOutTime).toBeUndefined();
    });

    it('should create valid work status for clocked out', () => {
      const clockInTime = new Date('2025-05-27T09:00:00');
      const clockOutTime = new Date('2025-05-27T18:00:00');
      const status: TodayWorkStatus = {
        status: 'clocked-out',
        clockInTime,
        clockOutTime,
        workDuration: 480,
        date: '2025-05-27',
      };

      expect(status.status).toBe('clocked-out');
      expect(status.clockInTime).toBe(clockInTime);
      expect(status.clockOutTime).toBe(clockOutTime);
      expect(status.workDuration).toBe(480);
    });
  });

  describe('ClockType', () => {
    it('should accept valid clock types', () => {
      const types: ClockType[] = ['clock-in', 'clock-out'];
      
      types.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });
  });

  describe('TimeCardData', () => {
    it('should create valid time card data structure', () => {
      const timeCardData: TimeCardData = {
        records: [
          {
            id: 'record-1',
            date: '2025-05-27',
            clockIn: new Date('2025-05-27T09:00:00'),
            clockOut: new Date('2025-05-27T18:00:00'),
            workDuration: 480,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        lastUpdated: new Date(),
      };

      expect(Array.isArray(timeCardData.records)).toBe(true);
      expect(timeCardData.records).toHaveLength(1);
      expect(timeCardData.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('FormattedTime', () => {
    it('should create valid formatted time structure', () => {
      const formattedTime: FormattedTime = {
        hours: 8,
        minutes: 30,
        display: '08:30',
      };

      expect(formattedTime.hours).toBe(8);
      expect(formattedTime.minutes).toBe(30);
      expect(formattedTime.display).toBe('08:30');
    });
  });

  describe('WorkStatistics', () => {
    it('should create valid work statistics structure', () => {
      const stats: WorkStatistics = {
        totalWorkTime: 2400, // 40時間
        averageWorkTime: 480, // 8時間
        workDays: 5,
        period: {
          start: '2025-05-26',
          end: '2025-05-30',
        },
      };

      expect(stats.totalWorkTime).toBe(2400);
      expect(stats.averageWorkTime).toBe(480);
      expect(stats.workDays).toBe(5);
      expect(stats.period.start).toBe('2025-05-26');
      expect(stats.period.end).toBe('2025-05-30');
    });
  });
});