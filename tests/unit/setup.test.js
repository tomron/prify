/**
 * Smoke test to verify Jest is set up correctly
 */
describe('Setup', () => {
  it('Jest should be working', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM APIs via jsdom', () => {
    const div = document.createElement('div');
    div.textContent = 'test';
    expect(div.textContent).toBe('test');
  });
});
