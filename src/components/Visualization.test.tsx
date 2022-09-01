import { AlertProvider } from '../layout';
import { Visualization } from './Visualization';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

beforeAll(() => {
  // Setup ResizeObserver and offset* properties
  // see: https://github.com/wbkd/react-flow/issues/716

  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));

  Object.defineProperties(window.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  (window.SVGElement as any).prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
});

describe('Visualization.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <Visualization />
      </AlertProvider>
    );
    const element = screen.getByTestId('react-flow-wrapper');
    expect(element).toBeInTheDocument();
  });
});
