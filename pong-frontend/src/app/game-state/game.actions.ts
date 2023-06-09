import { createAction, props } from '@ngrx/store';
import { vector } from './game.reducer';
import { GameStateType } from '../game.service';

export const CreateGame = createAction('[Game] Create Game');

export const MovePlayer1 = createAction(
  '[Game] Move Player 1',
  props<{ new_velocityY: number }>()
);

export const MovePlayer2 = createAction(
  '[Game] Move Player 2',
  props<{ new_velocityY: number }>()
);

export const UpdateBall = createAction(
  '[Game] Update Ball',
  props<{
    new_pos: { x: number, y: number },
    new_velocity: { x: number, y: number },
    new_speed: number
  }>()
)

export const IncrementPlayerScore1 = createAction(
  '[Game] Increment Player Score 1'
)

export const IncrementPlayerScore2 = createAction(
  '[Game] Increment Player Score 2',
)
export const ChangeState = createAction(
  '[Game] Change State',
  props<{
    new_state: GameStateType
  }>()
)
// export const loadTodosSuccess = createAction('[Todo] Load Todos Success', props<{ todos: Todo[] }>());
// export const addTodo = createAction('[Todo] Add Todo', props<{ todo: Todo }>());
// export const addTodoSuccess = createAction('[Todo] Add Todo Success', props<{ todo: Todo }>());
// export const deleteTodo = createAction('[Todo] Delete Todo', props<{ id: number }>());
// export const deleteTodoSuccess = createAction('[Todo] Delete Todo Success', props<{ id: number }>());
// export const updateTodo = createAction('[Todo] Update Todo', props<{ todo: Todo }>());
// export const updateTodoSuccess = createAction('[Todo] Update Todo Success', props<{ todo: Todo }>());
