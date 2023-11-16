import { createSlice } from '@reduxjs/toolkit'
import { initialState } from '../initial-state'
import { createTick } from '../actions/tick';
import { createRng } from '../rng';
import { State } from '../types';
import { createSpells } from '../spells/util/create-spells';
import {createDefaultLogic} from '../logic/default-logic';

const rng = createRng(0);
const spells = createSpells(rng);
const tick = createTick(rng, createDefaultLogic(spells));

export const mainSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    tick,
  },
})

export const { actions } = mainSlice;

export default mainSlice.reducer
