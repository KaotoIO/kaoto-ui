import { EffectCallback, useCallback, useEffect, useRef, useState } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    if (ref.current !== value) {
      ref.current = value;
    }
  }, [value]);

  return ref.current;
}

export function usePreviousRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef<T>(value);

  useEffect(() => {
    if (ref.current !== value) {
      ref.current = value;
    }
  }, [value]);

  return ref;
}

export function useController<T>(): [T | undefined, (controller: T) => void] {
  const [controller, setController] = useState<T | undefined>(undefined);

  const ref = useCallback((controller: T) => {
    setController(controller);
  }, []);

  return [controller, ref];
}

export type ArrowFunction<A, B> = (a: A) => B;

export class Holder<T> {
  constructor(private value: T) {}
  public readonly get = () => this.value;
  public readonly set = (newValue: T) => (this.value = newValue);
}

export type CancelableEffectParams = {
  canceled: Holder<boolean>;
};

export function useCancelableEffect(
  effect: (args: CancelableEffectParams) => ReturnType<EffectCallback>,
) {
  useEffect(() => {
    const canceled = new Holder(false);

    const effectCleanup = effect({ canceled });

    return () => {
      canceled.set(true);
      if (effectCleanup) {
        effectCleanup();
      }
    };
  }, [effect]);
}
