/**
 * 型定義のテスト（複数エントリ対応版）
 */
import { describe, it, expect } from '@jest/globals'
import type { 
  TimeRecord, 
  ClockEntry, 
  TodayWorkStatus, 
  WorkStatistics 
} from '../index'

describe('Types', () => {
  describe('ClockEntry', () => {
    it('should create a valid ClockEntry', () => {
      const clockEntry: ClockEntry = {
        id: '1',
        clockIn: new Date('2025-01-27T09:00:00'),
        clockOut: new Date('2025-01-27T17:00:00'),
        duration: 480,
      }

      expect(clockEntry.id).toBe('1')
      expect(clockEntry.clockIn).toBeInstanceOf(Date)
      expect(clockEntry.clockOut).toBeInstanceOf(Date)
      expect(clockEntry.duration).toBe(480)
    })

    it('should create a ClockEntry without clockOut (active entry)', () => {
      const clockEntry: ClockEntry = {
        id: '1',
        clockIn: new Date('2025-01-27T09:00:00'),
        clockOut: undefined,
        duration: undefined,
      }

      expect(clockEntry.id).toBe('1')
      expect(clockEntry.clockIn).toBeInstanceOf(Date)
      expect(clockEntry.clockOut).toBeUndefined()
      expect(clockEntry.duration).toBeUndefined()
    })
  })

  describe('TimeRecord', () => {
    it('should create a valid TimeRecord with multiple entries', () => {
      const timeRecord: TimeRecord = {
        id: '1',
        date: '2025-01-27',
        entries: [
          {
            id: 'entry-1',
            clockIn: new Date('2025-01-27T09:00:00'),
            clockOut: new Date('2025-01-27T12:00:00'),
            duration: 180,
          },
          {
            id: 'entry-2',
            clockIn: new Date('2025-01-27T13:00:00'),
            clockOut: new Date('2025-01-27T17:00:00'),
            duration: 240,
          },
        ],
        totalWorkDuration: 420,
        createdAt: new Date('2025-01-27T09:00:00'),
        updatedAt: new Date('2025-01-27T17:00:00'),
      }

      expect(timeRecord.id).toBe('1')
      expect(timeRecord.date).toBe('2025-01-27')
      expect(timeRecord.entries).toHaveLength(2)
      expect(timeRecord.totalWorkDuration).toBe(420)
    })
  })

  describe('TodayWorkStatus', () => {
    it('should create a TodayWorkStatus for not-clocked-in status', () => {
      const status: TodayWorkStatus = {
        status: 'not-clocked-in',
        entries: [],
        totalWorkDuration: 0,
        currentEntry: undefined,
        date: '2025-01-27',
      }

      expect(status.status).toBe('not-clocked-in')
      expect(status.entries).toHaveLength(0)
      expect(status.totalWorkDuration).toBe(0)
      expect(status.currentEntry).toBeUndefined()
      expect(status.date).toBe('2025-01-27')
    })

    it('should create a TodayWorkStatus for clocked-in status', () => {
      const currentEntry: ClockEntry = {
        id: 'entry-1',
        clockIn: new Date('2025-01-27T09:00:00'),
        clockOut: undefined,
        duration: undefined,
      }

      const status: TodayWorkStatus = {
        status: 'clocked-in',
        entries: [currentEntry],
        totalWorkDuration: 0,
        currentEntry,
        date: '2025-01-27',
      }

      expect(status.status).toBe('clocked-in')
      expect(status.entries).toHaveLength(1)
      expect(status.currentEntry).toBe(currentEntry)
      expect(status.date).toBe('2025-01-27')
    })

    it('should create a TodayWorkStatus for clocked-out status', () => {
      const completedEntry: ClockEntry = {
        id: 'entry-1',
        clockIn: new Date('2025-01-27T09:00:00'),
        clockOut: new Date('2025-01-27T17:00:00'),
        duration: 480,
      }

      const status: TodayWorkStatus = {
        status: 'clocked-out',
        entries: [completedEntry],
        totalWorkDuration: 480,
        currentEntry: undefined,
        date: '2025-01-27',
      }

      expect(status.status).toBe('clocked-out')
      expect(status.entries).toHaveLength(1)
      expect(status.currentEntry).toBeUndefined()
      expect(status.totalWorkDuration).toBe(480)
      expect(status.date).toBe('2025-01-27')
    })
  })

  describe('WorkStatistics', () => {
    it('should create valid WorkStatistics', () => {
      const statistics: WorkStatistics = {
        totalWorkTime: 2400, // 40時間 = 2400分
        averageWorkTime: 480, // 8時間 = 480分
        workDays: 5,
        period: {
          start: '2025-01-20',
          end: '2025-01-24',
        },
      }

      expect(statistics.totalWorkTime).toBe(2400)
      expect(statistics.averageWorkTime).toBe(480)
      expect(statistics.workDays).toBe(5)
      expect(statistics.period.start).toBe('2025-01-20')
      expect(statistics.period.end).toBe('2025-01-24')
    })
  })
})
