import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlowHash,
  UseStateTransitionOptions,
  UseStateTransitionResult,
  Dispatch,
  TransitionRequest,
  BaseStateType,
  DispatchMapFunction,
  StaticTransitionRequest,
  DispatchFunction
} from './types';

export const useStateTransition = <StateType extends BaseStateType>({
  initial,
  flows
}: UseStateTransitionOptions<StateType>): UseStateTransitionResult<StateType> => {
  const [state, setState] = useState<StateType>(initial);
  const [error, setError] = useState<Error | undefined>();
  const [transitionRequest, setTransitionRequest] = useState<TransitionRequest<StateType> | undefined>(undefined);

  const createKey = (from: StateType, to: StateType) => JSON.stringify([from, to]);

  const flowHash: FlowHash<StateType> = useMemo(() => {
    const hash: FlowHash<StateType> = flows.reduce((hash: FlowHash<StateType>, flow) => {
      const { from, to, on } = flow;
      const fromList = Array.isArray(from) ? from : [from];
      const toList = Array.isArray(to) ? to : [to];
      fromList.forEach((from) =>
        toList.forEach((to) => {
          const key = createKey(from, to);
          if (hash[key]) {
            throw new Error(`Duplicate state transition from ${from} to ${to}`);
          }
          hash[key] = flow;
        })
      );
      return hash;
    }, {});
    return hash;
  }, [flows]);

  const dispatch: Dispatch<StateType> = useCallback(
    (requiredState: StateType, data?: unknown) => {
      setTransitionRequest({
        to: requiredState,
        data
      });
    },
    [setTransitionRequest]
  );

  const dispatchFn: DispatchFunction<StateType> = useCallback(
    (requiredState: DispatchMapFunction<StateType>, data?: unknown) => {
      setTransitionRequest({
        to: requiredState,
        data
      });
    },
    [setTransitionRequest]
  );

  useEffect(() => {
    if (!transitionRequest) return setError(undefined);
    const { to: requestedState, data: givenData } = transitionRequest;

    const functionState = () => {
      const mapped = (requestedState as DispatchMapFunction<StateType>)(state, givenData);
      if (!mapped) {
        throw new Error('Dispatch map function returned no target state');
      }
      return mapped;
    };

    const { to, data } =
      typeof requestedState === 'function'
        ? functionState()
        : (transitionRequest as StaticTransitionRequest<StateType>);

    if (to === state) return setError(undefined);
    const transitionKey = createKey(state, to);
    const transition = flowHash[transitionKey];
    if (!transition) {
      return setError(new Error(`Undefined transition from ${state} to ${to}`));
    }
    setError(undefined);
    const { on } = transition;
    if (!on) {
      return setState(to);
    }
    on(to, setState, data);
  }, [transitionRequest]);

  return { state, dispatch, dispatchFn, error };
};
