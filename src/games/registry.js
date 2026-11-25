// Реестр игр. Новая игра = одна запись здесь; меню строится само.
// Каждая игра — контракт { id, title, tag, icon, category, mount(container, api), unmount() }.
import nebesny from './nebesny/index.js';
import western from './western/index.js';

export const GAMES = [nebesny, western];

// Разделы лобби (в порядке показа).
export const CATEGORIES = [
  { id: 'slots', titleKey: 'cat_slots' },
  { id: 'cards', titleKey: 'cat_cards' },
  { id: 'fast', titleKey: 'cat_fast' },
];

export function gameById(id) {
  return GAMES.find((g) => g.id === id) || null;
}
export function gamesByCategory(cat) {
  return GAMES.filter((g) => g.category === cat);
}
