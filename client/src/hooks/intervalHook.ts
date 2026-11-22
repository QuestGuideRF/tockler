import { useEffect, useRef } from 'react';
export function useInterval(callback: () => void, delay: number | null, runImmediately: boolean = false): void {
    const savedCallback = useRef<() => void>(() => {});
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        function tick(): void {
            savedCallback.current();
        }
        if (runImmediately) {
            tick();
        }
        if (delay !== null && delay > 0) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
        return;
    }, [delay, runImmediately]);
}