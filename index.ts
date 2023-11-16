import readline from 'readline';
import { stdin, stdout } from 'process';
import { store } from './src/store';
import { actions } from './src/slices/main-slice';

const rl = readline.promises.createInterface({
  input: stdin,
  output: stdout
});

const runSim = async () => {
  let exit = false;
  while (!exit) {
    await store.dispatch(actions.tick())
    let { mainSlice: state } = store.getState();
    console.log({
      t: state.t,
      error: state.player.lastError,
      gcd: state.player.cooldowns.global,
      buffs: state.player.buffs,
      comboPoints: state.player.comboPoints,
      energy: state.player.energy,
      log: state.combatLog
    })
    exit = await rl.question('') === 'exit';
  }
}

runSim().catch(console.error)

