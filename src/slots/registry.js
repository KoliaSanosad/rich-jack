// Реестр слотов. Добавить новый слот = добавить сюда одну запись.
// Общий «двигатель» (баланс, уровни, сохранение) один на всю игру; у слота — свои
// правила (def), своя графика (symbols) и свой стиль/бонус (meta).
import { SLOT1, WESTERN } from '../config.js';
import { SYMBOL_SVG } from '../slot/symbols.js';
import { WESTERN_SYMBOLS } from './western.symbols.js';

export const SLOTS = [
  {
    id: 'nebesny',
    name: 'Небесный Куш',
    tag: 'Космос · 10 линий',
    theme: 'space',
    logo: { top: 'Небесный', main: 'КУШ' },
    greet: 'Удачного полёта!',
    def: SLOT1,
    symbols: SYMBOL_SVG,
    // бонус: бесплатные вращения (scatter) — цикл вращений в main.js
  },
  {
    id: 'western',
    name: 'Дикий Запад',
    tag: 'Салун · 10 линий',
    theme: 'western',
    logo: { top: 'Дикий', main: 'ЗАПАД' },
    greet: 'Добро пожаловать в салун!',
    def: WESTERN,
    symbols: WESTERN_SYMBOLS,
    // бонусы: бесплатные вращения (звезда) + «Собери монеты» (подкова) — в main.js
  },
];

export function slotById(id) {
  return SLOTS.find((s) => s.id === id) || SLOTS[0];
}
