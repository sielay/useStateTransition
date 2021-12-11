import { FC, useCallback, useState, ReactNode, useEffect } from "react";
import { useStateTransition } from "../../useStateTransition";

/**
 * This is a simplified scenario, in which I'd like to use this hook.
 * Imagine the application that can open multiple editors. The editors
 * need a time to fully load and then fill default for the new content
 * or load some existing from the data source. Then it needs to manage
 * the changed state, saving and closing (incl. to save changes).
 */

/**
 *
 */
export enum EditorState {
  INIT = "init",
  READY = "ready",
  NEW = "new",
  LOAD = "load",
  OPEN = "open",
  MODIFIED = "modified",
  CLOSE = "close",
  CLOSED = "closed",
  SAVING = "saving",
}

export type StatesEditorCanEnter =
  | EditorState.READY
  | EditorState.OPEN
  | EditorState.MODIFIED
  | EditorState.CLOSED
  | EditorState.SAVING;

export type TestScenario = "new" | "load";

export const useEditor = (scenario: TestScenario) => {
  // State machine
  const { state, dispatch } = useStateTransition<EditorState>({
    initial: EditorState.INIT,
    flows: [
      {
        from: EditorState.INIT,
        to: EditorState.READY,
        on: (_, setState) => {
          setState(scenario === "new" ? EditorState.NEW : EditorState.LOAD);
        },
      },
      {
        from: [EditorState.NEW, EditorState.LOAD],
        to: EditorState.OPEN,
      },
      {
        from: [EditorState.OPEN, EditorState.MODIFIED, EditorState.CLOSE],
        to: [EditorState.MODIFIED, EditorState.OPEN, EditorState.CLOSE],
      },
      {
        from: [EditorState.CLOSE, EditorState.MODIFIED],
        to: EditorState.SAVING,
      },
      {
        from: EditorState.SAVING,
        to: [EditorState.OPEN, EditorState.CLOSED],
      },
    ],
  });

  useEffect(() => {
    const close = ({ data }: MessageEvent) => {
      if (data === "close") {
        dispatch(EditorState.CLOSE);
      }
    };
    window.addEventListener("message", close);
    return () => window.removeEventListener("message", close);
  }, [dispatch]);

  const externalDispatch = useCallback(
    (state: StatesEditorCanEnter, data?: unknown) => {
      dispatch(state, data);
    },
    [dispatch]
  );

  return { state, dispatch: externalDispatch };
};
