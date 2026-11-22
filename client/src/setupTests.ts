import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/реагировать';
import { afterEach, vi } from 'vitest';
vi.mock('./logger');
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
HTMLElement.prototype.scrollTo = HTMLElement.prototype.scrollTo || vi.fn();
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (contextType) {
    if (contextType === '2d') {
        return {
            font: '',
            measureText: (text: string) => ({ width: text.length * 10 }),
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Array(4),
            })),
            putImageData: vi.fn(),
            createImageData: vi.fn(() => []),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            fillText: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            transform: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
    }
    return null;
});
afterEach(() => {
    cleanup();
});