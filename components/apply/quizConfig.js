import GoalStep, { goalIsValid } from './fields/GoalStep';
import StateStep, { stateIsValid } from './fields/StateStep';
import DobStep, { dobIsValid } from './fields/DobStep';
import SexStep, { sexIsValid } from './fields/SexStep';
import HeightWeightStep, { heightWeightIsValid } from './fields/HeightWeightStep';

// The numbered quiz questions ("1 of N" ... "N of N"). Five are live today;
// the remaining questions slot in here the same way — add a new entry with
// an id, the step component, and an isValid(data) check. Nothing else in
// the flow (progress bar, step count, intro copy) needs to change, since
// it all reads from this array's length.
export const QUESTION_STEPS = [
  { id: 'goal', Component: GoalStep, isValid: goalIsValid },
  { id: 'state', Component: StateStep, isValid: stateIsValid },
  { id: 'dob', Component: DobStep, isValid: dobIsValid },
  { id: 'sex', Component: SexStep, isValid: sexIsValid },
  { id: 'heightWeight', Component: HeightWeightStep, isValid: heightWeightIsValid },
];
