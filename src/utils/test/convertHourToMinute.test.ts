import convertHourToMinute from '../convertHourToMinute';

describe('convertHourtToMinute Tests', () => {
  it('should convert a time in "hh:mm" format to minutes', () => {
    const minutes = convertHourToMinute('2:00');
    expect(minutes).toBe(120);
  });
});
