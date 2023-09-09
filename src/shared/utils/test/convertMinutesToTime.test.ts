import convertMinutesToTime from '../convertMinutesToTime';

describe('convertMinutesToTime Tests', () => {
  it('should convert minutes in a string in "hh:mm" format', () => {
    const minutes = convertMinutesToTime(755);
    expect(minutes).toBe('12:35');
  });

  it('should convert minutes in a string in "hh:mm" format when the hours and minutes is less than 9', () => {
    const minutes = convertMinutesToTime(120);
    expect(minutes).toBe('02:00');
  });
});
