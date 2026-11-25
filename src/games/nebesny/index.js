// Игра «Небесный Куш» — слот 1. Контракт { id, title, tag, icon, category, mount, unmount }.
import { createSlotGame } from '../slot/game.js';
import { NEBESNY_DEF } from './config.js';
import { SYMBOL_SVG } from './symbols.js';

export default createSlotGame({
  id: 'nebesny',
  category: 'slots',
  theme: 'space',
  titleKey: 'game_nebesny_title',
  tagKey: 'game_nebesny_tag',
  greetKey: 'game_nebesny_greet',
  logo: { top: 'Небесный', main: 'КУШ' },
  def: NEBESNY_DEF,
  symbols: SYMBOL_SVG,
});
