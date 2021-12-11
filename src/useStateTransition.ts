import { useCallback, useMemo, useState } from "react";
import {
    FlowHash, UseStateTransitionOptions,
    UseStateTransitionResult
} from "./types";

export const useStateTransition = <StateType>({
  initial,
  flows,
}: UseStateTransitionOptions<StateType>): UseStateTransitionResult<StateType> => {
  const [state, setState] = useState<StateType>(initial);
  const [previousState, setPreviousState] = useState<StateType>(initial);
  const [error, setError] = useState<Error | undefined>();

  const createKey = (from: StateType, to: StateType) =>
    JSON.stringify([from, to]);

  const flowHash: FlowHash<StateType> = useMemo(() => {
    const hash: FlowHash<StateType> = flows.reduce(
      (hash: FlowHash<StateType>, flow) => {
        const { from, to, on } = flow;
        const fromList = Array.isArray(from) ? from : [from];
        const toList = Array.isArray(to) ? to : [to];
        fromList.forEach((from) =>
          toList.forEach((to) => {
            const key = createKey(from, to);
            if (hash[key])
              throw new Error(
                `Duplicate state transition from ${from} to ${to}`
              );
            hash[key] = flow;
          })
        );
        return hash;
      },
      {}
    );
    return hash;
  }, [flows]);

  const dispatch: Dispatch<StateType> = useCallback(
    (requiredState: StateType) => {
      if (requiredState === state) return;
      const transitionKey = createKey(state, requiredState);
      const transition = flowHash[transitionKey];
      if (!transition) {
        return setError(
          new Error(`Undefined transition from ${state} to ${requiredState}`)
        );
      }
      const { on } = transition;
      if (!on) {
        return setState(requiredState);
      }
      on(previousState, requiredState, setState);
    },
    [previousState, state, flowHash, setState, setError]
  );

  return { state, dispatch, error };
};
