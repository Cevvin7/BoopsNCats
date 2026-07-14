import { useState } from 'react';
import { sanitizeCodeInput, MAX_CODE_LENGTH, RedeemStatus } from './codes.js';
import { THEMES } from './useTheme.js';
import './SettingsScreen.css';

const GITHUB_ISSUES_URL = 'https://github.com/Cevvin7/BoopsNCats/issues';
const KOFI_URL = 'https://ko-fi.com/cevvin';

const REDEEM_FEEDBACK = {
  [RedeemStatus.SUCCESS]: 'Code redeemed!',
  [RedeemStatus.ALREADY_USED]: 'That code has already been used.',
  [RedeemStatus.INVALID]: 'That code isn\'t valid.',
};

// Embedded in RoomViewport's screen area, same as UploadScreen -- see the
// `screen` prop there. Each entry here is self-contained; App.jsx only
// needs to thread through the theme + game-state actions, not any
// per-entry UI state.
export function SettingsScreen({ theme, onToggleTheme, onRedeemCode, onFactoryReset }) {
  const [codeInput, setCodeInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  function handleCodeInputChange(event) {
    setCodeInput(sanitizeCodeInput(event.target.value));
    setFeedback(null);
  }

  function handleRedeem() {
    if (!codeInput) return;
    const status = onRedeemCode(codeInput);
    setFeedback(REDEEM_FEEDBACK[status]);
    if (status === RedeemStatus.SUCCESS) setCodeInput('');
  }

  function handleFactoryReset() {
    if (!window.confirm('Are you sure you want to reset everything?')) return;
    if (!window.confirm('Your cat will be sad. This cannot be undone.')) return;
    onFactoryReset();
  }

  return (
    <div className="settings-screen">
      <h2>Settings</h2>

      <section className="settings-entry">
        <span className="settings-entry-label">Dark mode</span>
        <button
          type="button"
          role="switch"
          aria-checked={theme === THEMES.DARK}
          className={`settings-theme-toggle${theme === THEMES.DARK ? ' settings-theme-toggle--on' : ''}`}
          onClick={onToggleTheme}
        >
          <span className="settings-theme-toggle-knob" />
        </button>
      </section>

      <section className="settings-entry settings-entry--stacked">
        <span className="settings-entry-label">Redeem a code</span>
        <div className="settings-code-row">
          <input
            type="text"
            className="settings-code-input"
            value={codeInput}
            onChange={handleCodeInputChange}
            placeholder="CODE"
            maxLength={MAX_CODE_LENGTH}
            aria-label="Promo code"
          />
          <button type="button" className="settings-button" onClick={handleRedeem} disabled={!codeInput}>
            Redeem
          </button>
        </div>
        {feedback && <p className="settings-code-feedback">{feedback}</p>}
      </section>

      <section className="settings-entry">
        <a className="settings-link" href={KOFI_URL} target="_blank" rel="noopener noreferrer">
          Support on Ko-fi
        </a>
      </section>

      <section className="settings-entry settings-entry--stacked">
        <span className="settings-entry-label">Factory reset</span>
        <button type="button" className="settings-button settings-danger-button" onClick={handleFactoryReset}>
          Reset everything
        </button>
      </section>

      <section className="settings-entry">
        <a className="settings-link" href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
          Report a bug / request a feature
        </a>
      </section>
    </div>
  );
}
