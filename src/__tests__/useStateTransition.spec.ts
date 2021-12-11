/**
 * @jest-environment jsdom
 */
import { waitFor } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";
import { useStateTransition } from "../useStateTransition";

describe("useStateTransition", () => {
  it("Is a function", () => {
    expect(useStateTransition).toBeInstanceOf(Function);
  });

  describe("Simple state machine", () => {
    enum State {
      UNFOCUSED,
      FOCUSED,
    }
    it("Accepts known transitions and errors on unknown", () => {
      const { result } = renderHook(() =>
        useStateTransition<State>({
          initial: State.UNFOCUSED,
          flows: [
            {
              from: State.UNFOCUSED,
              to: State.FOCUSED,
            },
          ],
        })
      );
      expect(result.current.state).toBe(State.UNFOCUSED);
      expect(result.current.error).toBeUndefined();
      act(() => {
        result.current.dispatch(State.FOCUSED);
      });
      expect(result.current.state).toBe(State.FOCUSED);
      expect(result.current.error).toBeUndefined();
      act(() => {
        result.current.dispatch(State.UNFOCUSED);
      });
      expect(result.current.state).toBe(State.FOCUSED);
      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.dispatch(State.FOCUSED);
      });
      expect(result.current.state).toBe(State.FOCUSED);
      expect(result.current.error).toBeFalsy();
    });
    it("Crashes on duplicate flows", () => {
      const result = renderHook(() =>
        useStateTransition<number>({
          initial: 0,
          flows: [
            {
              from: 0,
              to: 1,
            },
            {
              from: [0, 1],
              to: 1,
            },
            {
              from: 0,
              to: 1,
            },
          ],
        })
      );
      expect(result.result.error).toBeTruthy();
    });
  });
});
