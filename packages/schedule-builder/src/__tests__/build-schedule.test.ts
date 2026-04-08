import {describe, expect, it} from 'vitest';

import {buildSchedule, mergeSchedules} from '../build-schedule.ts';

describe('buildSchedule', function () {
  it('should generate round-robin entries cycling through fuel sources', function () {
    const result = buildSchedule({
      intervalMinutes: 30,
      startMinutes: 0,
      fuelSourceIds: ['gel-a', 'gel-b'],
      iterations: 4,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([
      {timeMinutes: 0, fuelSourceIds: ['gel-a']},
      {timeMinutes: 30, fuelSourceIds: ['gel-b']},
      {timeMinutes: 60, fuelSourceIds: ['gel-a']},
      {timeMinutes: 90, fuelSourceIds: ['gel-b']},
    ]);
  });

  it('should generate all-each-time entries with all fuel sources per entry', function () {
    const result = buildSchedule({
      intervalMinutes: 20,
      startMinutes: 10,
      fuelSourceIds: ['gel', 'salt'],
      iterations: 3,
      rotationStrategy: 'all-each-time',
    });

    expect(result).toEqual([
      {timeMinutes: 10, fuelSourceIds: ['gel', 'salt']},
      {timeMinutes: 30, fuelSourceIds: ['gel', 'salt']},
      {timeMinutes: 50, fuelSourceIds: ['gel', 'salt']},
    ]);
  });

  it('should handle single fuel source in round-robin', function () {
    const result = buildSchedule({
      intervalMinutes: 15,
      startMinutes: 0,
      fuelSourceIds: ['gel'],
      iterations: 3,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([
      {timeMinutes: 0, fuelSourceIds: ['gel']},
      {timeMinutes: 15, fuelSourceIds: ['gel']},
      {timeMinutes: 30, fuelSourceIds: ['gel']},
    ]);
  });

  it('should return empty array for zero iterations', function () {
    const result = buildSchedule({
      intervalMinutes: 30,
      startMinutes: 0,
      fuelSourceIds: ['gel'],
      iterations: 0,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([]);
  });

  it('should return empty array for empty fuel sources', function () {
    const result = buildSchedule({
      intervalMinutes: 30,
      startMinutes: 0,
      fuelSourceIds: [],
      iterations: 5,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([]);
  });

  it('should respect start offset', function () {
    const result = buildSchedule({
      intervalMinutes: 30,
      startMinutes: 15,
      fuelSourceIds: ['gel'],
      iterations: 2,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([
      {timeMinutes: 15, fuelSourceIds: ['gel']},
      {timeMinutes: 45, fuelSourceIds: ['gel']},
    ]);
  });

  it('should cycle round-robin with 3 sources', function () {
    const result = buildSchedule({
      intervalMinutes: 20,
      startMinutes: 0,
      fuelSourceIds: ['a', 'b', 'c'],
      iterations: 5,
      rotationStrategy: 'round-robin',
    });

    expect(result).toEqual([
      {timeMinutes: 0, fuelSourceIds: ['a']},
      {timeMinutes: 20, fuelSourceIds: ['b']},
      {timeMinutes: 40, fuelSourceIds: ['c']},
      {timeMinutes: 60, fuelSourceIds: ['a']},
      {timeMinutes: 80, fuelSourceIds: ['b']},
    ]);
  });
});

describe('mergeSchedules', function () {
  it('should merge entries at the same time', function () {
    const schedule1 = [{timeMinutes: 30, fuelSourceIds: ['gel']}];
    const schedule2 = [{timeMinutes: 30, fuelSourceIds: ['salt']}];

    const result = mergeSchedules([schedule1, schedule2]);

    expect(result).toEqual([{timeMinutes: 30, fuelSourceIds: ['gel', 'salt']}]);
  });

  it('should sort merged entries by time', function () {
    const schedule1 = [
      {timeMinutes: 60, fuelSourceIds: ['gel']},
      {timeMinutes: 20, fuelSourceIds: ['gel']},
    ];
    const schedule2 = [{timeMinutes: 45, fuelSourceIds: ['salt']}];

    const result = mergeSchedules([schedule1, schedule2]);

    expect(result).toEqual([
      {timeMinutes: 20, fuelSourceIds: ['gel']},
      {timeMinutes: 45, fuelSourceIds: ['salt']},
      {timeMinutes: 60, fuelSourceIds: ['gel']},
    ]);
  });

  it('should deduplicate fuel sources at the same time', function () {
    const schedule1 = [{timeMinutes: 30, fuelSourceIds: ['gel', 'salt']}];
    const schedule2 = [{timeMinutes: 30, fuelSourceIds: ['salt', 'water']}];

    const result = mergeSchedules([schedule1, schedule2]);

    expect(result).toEqual([{timeMinutes: 30, fuelSourceIds: ['gel', 'salt', 'water']}]);
  });

  it('should handle empty schedules', function () {
    const result = mergeSchedules([[], []]);

    expect(result).toEqual([]);
  });

  it('should handle single schedule passthrough', function () {
    const schedule = [
      {timeMinutes: 0, fuelSourceIds: ['gel']},
      {timeMinutes: 30, fuelSourceIds: ['salt']},
    ];

    const result = mergeSchedules([schedule]);

    expect(result).toEqual(schedule);
  });
});
