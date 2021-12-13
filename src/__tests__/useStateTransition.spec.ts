/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useStateTransition } from '../useStateTransition';
import { DispatchMapFunction } from '../types';

describe('useStateTransition', () => {
  it('Is a function', () => {
    expect(useStateTransition).toBeInstanceOf(Function);
  });

  describe('Simple state machine', () => {
    enum State {
      UNFOCUSED,
      FOCUSED
    }
    it('Accepts known transitions and errors on unknown', () => {
      const { result } = renderHook(() =>
        useStateTransition<State>({
          initial: State.UNFOCUSED,
          flows: [
            {
              from: State.UNFOCUSED,
              to: State.FOCUSED
            }
          ]
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
    it('Crashes on duplicate flows', () => {
      const { result } = renderHook(() =>
        useStateTransition<number>({
          initial: 0,
          flows: [
            {
              from: 0,
              to: 1
            },
            {
              from: [0, 1],
              to: 1
            },
            {
              from: 0,
              to: 1
            }
          ]
        })
      );
      expect(result.error).toBeTruthy();
    });

    it('Works with dispatch map functions', () => {
      const { result } = renderHook(() =>
        useStateTransition<number>({
          initial: 0,
          flows: [
            {
              from: 0,
              to: [1, 2]
            },
            { from: 1, to: 0 },
            { from: 2, to: [0, 1] }
          ]
        })
      );
      act(() => {
        result.current.dispatch(1);
      });
      expect(result.current.state).toEqual(1);

      const mapper: DispatchMapFunction<number> = (state: number) => {
        if (state === 1) {
          return { to: 0, data: 'ABC' };
        }
        if (state === 2) {
          return { to: 1 };
        }
      };

      act(() => {
        result.current.dispatch(mapper);
      });

      expect(result.current.error).toBeUndefined();
      expect(result.current.state).toEqual(0);

      act(() => {
        result.current.dispatch(2);
      });
      expect(result.current.error).toBeUndefined();
      expect(result.current.state).toEqual(2);
      act(() => {
        result.current.dispatch(mapper);
      });
      expect(result.current.error).toBeUndefined();
      expect(result.current.state).toEqual(1);
    });
  });
});
