// Игра «Дикий Запад» — слот 2. Контракт { id, title, tag, icon, category, mount, unmount }.
import { createSlotGame } from '../slot/game.js';
import { WESTERN_DEF } from './config.js';
import { WESTERN_SYMBOLS } from './symbols.js';

export default createSlotGame({
  id: 'western',
  category: 'slots',
  theme: 'western',
  titleKey: 'game_western_title',
  tagKey: 'game_western_tag',
  greetKey: 'game_western_greet',
  logo: { top: 'Дикий', main: 'ЗАПАД' },
  def: WESTERN_DEF,
  symbols: WESTERN_SYMBOLS,
});
