export type BaseStateType = string | number;

type DispatchMapFunctionResult<StateType extends BaseStateType> = { to: StateType; data?: unknown };
export type DispatchMapFunction<StateType extends BaseStateType> = (
  currentState: StateType,
  data?: unknown
) => DispatchMapFunctionResult<StateType>;
export type DispatchFunction<StateType extends BaseStateType> = (mapFunction: DispatchMapFunction<StateType>) => void;

export type Dispatch<StateType extends BaseStateType> = (
  requiredState: StateType,
  data?: unknown
) => void | DispatchFunction<StateType>;

export interface StateTransitionFlow<StateType extends BaseStateType> {
  from: StateType | StateType[];
  to: StateType | StateType[];
  on?: (requestedState: StateType, setState: Dispatch<StateType>, data?: unknown) => void;
}

export type FlowHash<StateType extends BaseStateType> = Record<string, StateTransitionFlow<StateType>>;

export interface UseStateTransitionOptions<StateType extends BaseStateType> {
  initial: StateType;
  flows: StateTransitionFlow<StateType>[];
}

export type UseStateTransitionResult<StateType extends BaseStateType> = {
  state: StateType;
  dispatch: Dispatch<StateType>;
  error?: Error;
};

export interface TransitionRequest<StateType extends BaseStateType> {
  to: StateType | DispatchMapFunction<StateType>;
  data?: unknown;
}

export interface StaticTransitionRequest<StateType extends BaseStateType> {
  to: StateType;
  data?: unknown;
}
