export type Dispatch<StateType> = (requiredState: StateType) => void;

export interface StateTransitionFlow<StateType> {
  from: StateType | StateType[];
  to: StateType | StateType[];
  on?: (
    previousState: StateType,
    requestedState: StateType,
    setState: Dispatch<StateType>
  ) => void;
}

export type FlowHash<StateType> = Record<
  string,
  StateTransitionFlow<StateType>
>;

export interface UseStateTransitionOptions<StateType> {
  initial: StateType;
  flows: StateTransitionFlow<StateType>[];
}

export type UseStateTransitionResult<StateType> = {
  state: StateType;
  dispatch: Dispatch<StateType>;
  error?: Error;
};
