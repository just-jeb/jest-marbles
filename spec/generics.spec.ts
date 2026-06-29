import { cold, hot } from '../index';

interface MyEvent {
  type: string;
  payload: number;
}

describe('cold() and hot() generics (#551)', () => {
  it('cold<T> infers the value type from the values record', () => {
    const event: MyEvent = { type: 'click', payload: 42 };
    // TypeScript should infer ColdObservable<MyEvent> — if cold() did not have
    // the generic, passing a typed values map would require a cast to `object`.
    const obs$ = cold<MyEvent>('-a|', { a: event });
    // The source observable carries the right element type
    expect(obs$).toBeObservable(cold<MyEvent>('-a|', { a: event }));
  });

  it('hot<T> infers the value type from the values record', () => {
    const event: MyEvent = { type: 'click', payload: 42 };
    const obs$ = hot<MyEvent>('-a|', { a: event });
    expect(obs$).toBeObservable(cold<MyEvent>('-a|', { a: event }));
  });

  it('cold() without explicit T defaults to unknown and accepts any value', () => {
    // Should compile without errors even when values are mixed types
    const obs$ = cold('-a-b|', { a: 1, b: 'two' });
    expect(obs$).toBeObservable(cold('-a-b|', { a: 1, b: 'two' }));
  });
});
