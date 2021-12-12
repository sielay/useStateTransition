export enum EditorState {
  INIT = 'init',
  READY = 'ready',
  NEW = 'new',
  LOAD = 'load',
  OPEN = 'open',
  MODIFIED = 'modified',
  CLOSE = 'close',
  CLOSED = 'closed',
  SAVING = 'saving'
}

export type StatesEditorCanEnter =
  | EditorState.READY
  | EditorState.OPEN
  | EditorState.MODIFIED
  | EditorState.CLOSED
  | EditorState.SAVING;

export type TestScenario = 'new' | 'load';
