import '@testing-library/jest-dom';

// Jestがテスト中にブラウザAPIを呼び出せるようにするためのモック
// 必要に応じてグローバルオブジェクトを拡張

if (typeof window !== 'undefined') {
  // localStorageのモック
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // matchMediaのモック
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // 非推奨
      removeListener: jest.fn(), // 非推奨
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}