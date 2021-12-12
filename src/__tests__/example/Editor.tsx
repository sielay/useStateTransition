import React, { FC, useState } from 'react';
import { EditorState, TestScenario } from './types';
import { useEditor } from './useEditor';

export const Editor: FC<{
  scenario: TestScenario;
}> = ({ scenario }) => {
  const { state, dispatch } = useEditor(scenario);
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
