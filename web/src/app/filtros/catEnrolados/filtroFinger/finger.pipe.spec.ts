import { FingerPipe } from './finger.pipe';

describe('FingerPipe', () => {
  it('create an instance', () => {
    const pipe = new FingerPipe();
    expect(pipe).toBeTruthy();
  });
});
