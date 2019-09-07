import { cold } from "../index";
import { tap } from "rxjs/operators";

describe("toSatisfyOnFlush", () => {
    it('should verify mock has been called', () => {
        const mock = jest.fn();
        const stream$ = cold('blah|').pipe(tap(mock));
        expect(stream$).toSatisfyOnFlush(() => {
          expect(mock.mock.calls.length).toEqual(4);
        });
      })
})
