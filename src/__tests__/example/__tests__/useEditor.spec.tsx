import React from "react";
import { useEditor, EditorState } from "../useEditor";
import { Editor } from "../Editor";
import { render, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

describe("useEditor example", () => {
  it("it is a function", () => {
    expect(useEditor).toBeInstanceOf(Function);
  });
});

describe("Editor", () => {
  it("supports new content lifecycle", async () => {
    const screen = render(<Editor scenario="new" />);
    const { queryByText, queryByTestId } = screen;

    expect(queryByText("Invalid")).not.toBeInTheDocument();

    expect(queryByTestId("state").textContent).toEqual(EditorState.INIT);
    expect(queryByText("Load assets")).toBeInTheDocument();

    userEvent.click(queryByText("Load assets"));
    expect(queryByText("Fill with defaults")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.NEW);

    userEvent.click(queryByText("Fill with defaults"));
    expect(queryByText("Modify")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.OPEN);

    userEvent.click(queryByText("Modify"));
    const revert = queryByText("Revert");
    expect(revert).toBeInTheDocument();
    expect(queryByText("Save")).toBeInTheDocument();
    expect(queryByTestId("modified").textContent).toEqual("true");
    expect(queryByTestId("state").textContent).toEqual(EditorState.MODIFIED);

    userEvent.click(revert);
    expect(revert).not.toBeInTheDocument();
    expect(queryByText("Modify")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.OPEN);

    userEvent.click(queryByText("Modify"));
    expect(queryByTestId("state").textContent).toEqual(EditorState.MODIFIED);

    // this should come from outside
    fireEvent(window, new MessageEvent("message", { data: "close" }));
    expect(queryByText("Cancel")).toBeInTheDocument();
    expect(queryByTestId("modified").textContent).toEqual("true");
    expect(queryByText("Save")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.CLOSE);

    userEvent.click(queryByText("Cancel"));
    expect(queryByText("Cancel")).not.toBeInTheDocument();
    expect(queryByText("Save")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.MODIFIED);
    expect(queryByTestId("modified").textContent).toEqual("true");

    // this should come from outside
    fireEvent(window, new MessageEvent("message", { data: "close" }));
    userEvent.click(queryByText("Save"));

    await waitFor(() =>
      expect(queryByTestId("modified").textContent).toEqual("false")
    );
    expect(queryByTestId("state").textContent).toEqual(EditorState.CLOSED);
  });

  it("supports new content lifecycle", async () => {
    const screen = render(<Editor scenario="load" />);
    const { queryByText, queryByTestId } = screen;

    expect(queryByText("Invalid")).not.toBeInTheDocument();

    expect(queryByTestId("state").textContent).toEqual(EditorState.INIT);
    expect(queryByText("Load assets")).toBeInTheDocument();

    userEvent.click(queryByText("Load assets"));
    expect(queryByText("Load from storage")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.LOAD);

    userEvent.click(queryByText("Load from storage"));
    expect(queryByText("Modify")).toBeInTheDocument();
    expect(queryByTestId("state").textContent).toEqual(EditorState.OPEN);
  });
});
