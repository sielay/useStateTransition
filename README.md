# useStateTransition

If you look for a classic state machine, check [cassiozen/useStateMachine](https://github.com/cassiozen/useStateMachine).

## Problem

One of my project is an app that can open various editors. Each editor can have different implementation, but needs to follow the same lifecycle. I wanted to provide a neat small hook that would handle it, so specific editors don't have too keep too much knowledge about the host app.

While doing it turned out I need some sort of state machine. The difference was that I need it to be focused more on transition between specific states.

Other nice projects implementing state machine hook were following enter/leave version of the pattern, that was focused on the state, rather than transition.

## Example

Check the [tests example](./src/__tests__/example/useEditor.tsx).

```ts
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
    ],
  });
```

## API

```ts
const { state, dispatch, error } = useStateTransition<StateType>(options)
```

### state

Current state of provided `StateType`. The first value comes from `initial` field in `options`.

### dispatch

```ts
type Dispatch = (requestedState: StateType, data?: unknown) => void;
```

You use it to trigger the transition. Transition to the same state won't trigger any updates. If the request create unknown transition `error` will be populated.

### error

Display the latest error. At the moment it reports only about unknown transitions.

### options

You need to define the `initialValue` of the state and the flows.

```ts
{
    initialValue: StateType,
    flows: Flow[]
}
```

### Flow

```ts
{
    from: StateType | StateType[],
    to: State | StateType[],
    on?: (requestedState: StateType, setState: (state: StateType) => void, data?: unknown) => void;
}
```

 * `from` defines the state you want to transition from; you can specify one or many states.
 * `to` defines the state you want to transition to; you can specify oen or many states.
 * `on` (optional)
    * if absent the state machine will just allow transition
    * if present it works like a guard, in the end you can specify which state you want to set. It won't trigger another guard or test, it will just update the sate.
    * you have access to `data` passed, so you can update your other hooks.
    * it happens in `useEffect`

## License

MIT