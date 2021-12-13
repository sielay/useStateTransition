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
import debug from 'debug';

const log = debug('useStateTransition');

export const useStateTransition = <StateType extends BaseStateType>({
  initial,
  flows
}: UseStateTransitionOptions<StateType>): UseStateTransitionResult<StateType> => {
  const [state, setState] = useState<StateType>(initial);
  const [error, setError] = useState<Error | undefined>();
  const [transitionRequest, setTransitionRequest] = useState<TransitionRequest<StateType> | undefined>(undefined);

  log('current state', state, 'error: ', error);

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
      log('dispatch', requiredState, data);
      setTransitionRequest({
        to: requiredState,
        data
      });
    },
    [setTransitionRequest]
  );

  const dispatchFn: DispatchFunction<StateType> = useCallback(
    (requiredState: DispatchMapFunction<StateType>, data?: unknown) => {
      log('dispatchFn', requiredState, data);
      setTransitionRequest({
        to: requiredState,
        data
      });
    },
    [setTransitionRequest]
  );

  useEffect(() => {
    if (!transitionRequest) {
      log('empty request - abandon');
      return setError(undefined);
    }
    const { to: requestedState, data: givenData } = transitionRequest;

    const functionState = () => {
      const mapped = (requestedState as DispatchMapFunction<StateType>)(state, givenData);
      if (!mapped) {
        throw new Error('Dispatch map function returned no target state');
      }
      log('mapped request', mapped);
      return mapped;
    };

    const { to, data } =
      typeof requestedState === 'function'
        ? functionState()
        : (transitionRequest as StaticTransitionRequest<StateType>);

    if (to === state) {
      log('pointless reques - abandon');
      return setError(undefined);
    }
    log(`tranition from ${state} to ${to}`);
    const transitionKey = createKey(state, to);
    const transition = flowHash[transitionKey];
    if (!transition) {
      return setError(new Error(`Undefined transition from ${state} to ${to}`));
    }
    setError(undefined);
    const { on } = transition;
    if (!on) {
      log(`no guard transition from ${state} to ${to}, update state`);
      return setState(to);
    }
    log(`guard transition from ${state} to ${to}, update state`);
    on(to, setState, data);
  }, [transitionRequest]);

  return { state, dispatch, dispatchFn, error };
};
