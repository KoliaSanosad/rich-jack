// Экран 18+ при первом запуске. Без подтверждения игра не открывается.
import * as storage from './storage.js';
import { openModal, closeModal } from './ui.js';
import { t } from '../i18n/index.js';

export function needsAgeGate() {
  return !storage.get().ageConfirmed;
}

export function showAgeGate(onOk) {
  openModal(
    `<div class="age" data-testid="age-gate"><p class="big18">18+</p><p>${t('age_text')}</p>
     <button class="btn" id="ageOk" data-testid="age-ok">${t('age_btn')}</button></div>`,
    { closable: false },
  );
  document.getElementById('ageOk').onclick = () => {
    storage.update((s) => { s.ageConfirmed = true; });
    closeModal();
    onOk?.();
  };
}
