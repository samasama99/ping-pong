import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Color, GameState, GameStateType, Player, Position, Score, initialState } from './game.state';


const game = createSlice({
  name: "game",
  initialState,
  reducers: {
    CreateGame: () => { },
    SendMyPaddlePosition: (state: GameState, action: PayloadAction<Position>) => {
      state.myPaddle = action.payload;
    },
    UpdateOpponentPosition: (state: GameState, action: PayloadAction<Position>) => {
      state.opponentPaddle = action.payload;
    },
    UpdateBall: (state: GameState, action: PayloadAction<Position>) => {
      state.ball = action.payload;
    },
    UpdateScore: (state: GameState, action: PayloadAction<Score>) => {
      state.score = action.payload;
    },
    UpdateGameState: (state: GameState, action: PayloadAction<GameStateType>) => {
      state.state = action.payload;
    },
    SetPlayerNumber: (state: GameState, action: PayloadAction<Player>) => {
      state.playerNumber = action.payload;
    },
    SetColor: (state: GameState, action: PayloadAction<Color>) => {
      state.color = action.payload;
    },
  }
});

export const {
  reducer,
  actions: {
    CreateGame,
    SendMyPaddlePosition,
    UpdateOpponentPosition,
    UpdateBall,
    UpdateScore,
    UpdateGameState,
    SetPlayerNumber,
    SetColor
  },
  name
} = game;
