import { AsyncThunkPayloadCreator, configureStore, createAsyncThunk } from '@reduxjs/toolkit'
import { Rng, State } from './types'
import { createRng } from './rng'
import { mainSlice } from './slices/main-slice'

export const store = configureStore({
  reducer: {
    mainSlice: mainSlice.reducer,
  },
  middleware: (getDefault) => getDefault({
    thunk: {
      extraArgument: { rng: createRng(0) }
    }
  })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

type AppThunkApi = {
  state: State;
  dispatch: AppDispatch;
  extra: { rng: Rng }
}

export const createAppAsyncThunk = <R, A> (
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<R, A, AppThunkApi>
) => createAsyncThunk<R, A, AppThunkApi>(typePrefix, payloadCreator)
