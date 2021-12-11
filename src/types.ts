export type Dispatch<StateType> = (requiredState: StateType, data?: unknown) => void;

export interface StateTransitionFlow<StateType> {
  from: StateType | StateType[];
  to: StateType | StateType[];
  on?: (
    requestedState: StateType,
    setState: Dispatch<StateType>,
    data?: unknown
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

export interface TransitionRequest<StateType> {
  to: StateType;
  data?: unknown;
}
