/**
 * PKM common same-message MVU autofill.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

  COMMON.createMessageAutofill = function createMessageAutofill(ctx) {
    function autofillText(content) {
      if (typeof ctx?.CORE?.autofillPokemonStatsInText !== 'function') {
        return { changed: false, content: String(content || '') };
      }
      return ctx.CORE.autofillPokemonStatsInText(content);
    }

    async function handleBeforeMessageUpdate(event) {
      const result = autofillText(event?.message_content || '');
      if (result.changed) event.message_content = result.content;
      return result;
    }

    async function handleMessageRendered(messageId) {
      const hostRoot = ctx.ROOT;
      if (messageId === undefined || messageId === null) return { changed: false };
      if (typeof hostRoot.getChatMessages !== 'function' || typeof hostRoot.setChatMessages !== 'function') {
        return { changed: false };
      }
      const messages = hostRoot.getChatMessages(messageId);
      const msg = Array.isArray(messages) ? messages[0] : null;
      const result = autofillText(msg?.message || '');
      if (result.changed) {
        await hostRoot.setChatMessages([{ message_id: messageId, message: result.content }], { refresh: 'affected' });
      }
      return result;
    }

    return {
      autofillText,
      handleBeforeMessageUpdate,
      handleMessageRendered
    };
  };
})();
