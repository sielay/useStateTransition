import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EditorState } from '../types';
import { useEditor, EditorProvider, Editor } from '../context';

describe('context example', () => {
  it('it is a function', () => {
    expect(useEditor).toBeInstanceOf(Function);
    expect(EditorProvider).toBeInstanceOf(Function);
  });
  it('throws without a context', () => {
    const { result } = renderHook(useEditor);
    expect(result.error).toBeTruthy();
  });
  it('start with a context', () => {
    const { result } = renderHook(useEditor, { wrapper: EditorProvider });
    expect(result.error).toBeFalsy();
  });
});

describe('Editor', () => {
  it('supports new content lifecycle', async () => {
    const screen = render(
      <EditorProvider scenario="new">
        <Editor />
      </EditorProvider>
    );
    const { queryByText, queryByTestId } = screen;

    expect(queryByText('Invalid')).not.toBeInTheDocument();

    expect(queryByTestId('state')?.textContent).toEqual(EditorState.INIT);
    expect(queryByText('Load assets')).toBeInTheDocument();

    const loadAssets = queryByText('Load assets');
    loadAssets && userEvent.click(loadAssets);
    expect(queryByText('Fill with defaults')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.NEW);

    const fillWithDefaults = queryByText('Fill with defaults');
    fillWithDefaults && userEvent.click(fillWithDefaults);
    expect(queryByText('Modify')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.OPEN);

    const modify = queryByText('Modify');
    modify && userEvent.click(modify);
    const revert = queryByText('Revert');
    expect(revert).toBeInTheDocument();
    expect(queryByText('Save')).toBeInTheDocument();
    expect(queryByTestId('modified')?.textContent).toEqual('true');
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.MODIFIED);

    revert && userEvent.click(revert);
    expect(revert).not.toBeInTheDocument();
    expect(queryByText('Modify')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.OPEN);

    const modify2 = queryByText('Modify');
    modify2 && userEvent.click(modify2);
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.MODIFIED);

    // this should come from outside
    fireEvent(window, new MessageEvent('message', { data: 'close' }));
    expect(queryByText('Cancel')).toBeInTheDocument();
    expect(queryByTestId('modified')?.textContent).toEqual('true');
    expect(queryByText('Save')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.CLOSE);

    const cancel = queryByText('Cancel');
    cancel && userEvent.click(cancel);
    expect(queryByText('Cancel')).not.toBeInTheDocument();
    expect(queryByText('Save')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.MODIFIED);
    expect(queryByTestId('modified')?.textContent).toEqual('true');

    // this should come from outside
    fireEvent(window, new MessageEvent('message', { data: 'close' }));
    const save = queryByText('Save');
    save && userEvent.click(save);

    await waitFor(() => expect(queryByTestId('modified')?.textContent).toEqual('false'));
    expect(queryByTestId('state')).not.toBeInTheDocument();
  });

  it('supports new content lifecycle', async () => {
    const screen = render(
      <EditorProvider scenario="load">
        <Editor />
      </EditorProvider>
    );
    const { queryByText, queryByTestId } = screen;

    expect(queryByText('Invalid')).not.toBeInTheDocument();

    expect(queryByTestId('state')?.textContent).toEqual(EditorState.INIT);
    expect(queryByText('Load assets')).toBeInTheDocument();

    const loadAssets = queryByText('Load assets');
    loadAssets && userEvent.click(loadAssets);
    expect(queryByText('Load from storage')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.LOAD);

    const loadFromStorage = queryByText('Load from storage');
    loadFromStorage && userEvent.click(loadFromStorage);
    expect(queryByText('Modify')).toBeInTheDocument();
    expect(queryByTestId('state')?.textContent).toEqual(EditorState.OPEN);
  });
});
