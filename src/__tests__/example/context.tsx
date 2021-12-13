import React, { useContext, useEffect, createContext, PropsWithChildren, useCallback, FC, useState } from 'react';
import { EditorState, StatesEditorCanEnter, TestScenario } from './types';
import { useStateTransition } from '../../useStateTransition';
import { UseStateTransitionResult, Dispatch } from '../../types';

const EditorContext = createContext<Omit<UseStateTransitionResult<EditorState>, 'dispatchFn'> | null>(null);

export function EditorProvider({ children, scenario }: PropsWithChildren<{ scenario: TestScenario }>): JSX.Element {
  const { state, dispatch, error } = useStateTransition<EditorState>({
    initial: EditorState.INIT,
    flows: [
      {
        from: EditorState.INIT,
        to: EditorState.READY,
        on: (_, setState) => {
          setState(scenario === 'new' ? EditorState.NEW : EditorState.LOAD);
        }
      },
      {
        from: [EditorState.NEW, EditorState.LOAD],
        to: EditorState.OPEN
      },
      {
        from: [EditorState.OPEN, EditorState.MODIFIED, EditorState.CLOSE],
        to: [EditorState.MODIFIED, EditorState.OPEN, EditorState.CLOSE]
      },
      {
        from: [EditorState.CLOSE, EditorState.MODIFIED],
        to: EditorState.SAVING
      },
      {
        from: EditorState.SAVING,
        to: [EditorState.OPEN, EditorState.CLOSED]
      }
    ]
  });

  useEffect(() => {
    const close = ({ data }: MessageEvent) => {
      if (data === 'close') {
        dispatch(EditorState.CLOSE);
      }
    };
    window.addEventListener('message', close);
    return () => window.removeEventListener('message', close);
  }, [dispatch]);

  const externalDispatch = useCallback(
    (state: StatesEditorCanEnter, data?: unknown) => {
      dispatch(state, data);
    },
    [dispatch]
  );

  const value: Omit<UseStateTransitionResult<EditorState>, 'dispatchFn'> = {
    state,
    dispatch: externalDispatch as Dispatch<EditorState>,
    error
  };

  return (
    <EditorContext.Provider value={value}>{state === EditorState.CLOSED ? <div /> : children}</EditorContext.Provider>
  );
}

export function useEditor(): Omit<UseStateTransitionResult<EditorState>, 'dispatchFn'> {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor hooks is attempting to be used out side of its provider');
  }

  return context;
}

export const Editor: FC<unknown> = () => {
  const { state, dispatch } = useEditor();
  const [modified, setModified] = useState<boolean>(false);

  return (
    <div>
      {state === EditorState.INIT && (
        <button key="init" onClick={() => dispatch(EditorState.READY)}>
          Load assets
        </button>
      )}
      {state === EditorState.NEW && (
        <button key="new" onClick={() => dispatch(EditorState.OPEN)}>
          Fill with defaults
        </button>
      )}
      {state === EditorState.LOAD && (
        <button key="load" onClick={() => dispatch(EditorState.OPEN, { id: 123 })}>
          Load from storage
        </button>
      )}
      {state === EditorState.OPEN && (
        <button
          key="modify"
          onClick={() => {
            setModified(true);
            dispatch(EditorState.MODIFIED);
          }}
        >
          Modify
        </button>
      )}
      {state === EditorState.MODIFIED && (
        <button
          key="revert"
          onClick={() => {
            setModified(false);
            dispatch(EditorState.OPEN);
          }}
        >
          Revert
        </button>
      )}
      {[EditorState.MODIFIED, EditorState.CLOSE].includes(state) && modified && (
        <button
          key="save"
          onClick={() => {
            dispatch(EditorState.SAVING);
            setTimeout(() => {
              setModified(false);
              const next = state === EditorState.CLOSE ? EditorState.CLOSED : EditorState.OPEN;
              dispatch(next);
            }, 10);
          }}
        >
          Save
        </button>
      )}
      {state === EditorState.CLOSE && (
        <button
          key="cancel"
          onClick={() => {
            dispatch(EditorState.MODIFIED);
          }}
        >
          Cancel
        </button>
      )}

      <pre data-testid="state">{state}</pre>
      <pre data-testid="modified">{modified ? 'true' : 'false'}</pre>
    </div>
  );
};
