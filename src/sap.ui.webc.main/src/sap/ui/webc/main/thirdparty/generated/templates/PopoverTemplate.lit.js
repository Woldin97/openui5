sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(context.styles.root)}" class="${(0, _LitRenderer.classMap)(context.classes.root)}" role="dialog" aria-modal="${(0, _LitRenderer.ifDefined)(context._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(context._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._ariaLabelledBy)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><span class="ui5-popover-arrow" style="${(0, _LitRenderer.styleMap)(context.styles.arrow)}"></span>${context._displayHeader ? block1(context, tags, suffix) : undefined}<div style="${(0, _LitRenderer.styleMap)(context.styles.content)}" class="${(0, _LitRenderer.classMap)(context.classes.content)}"  @scroll="${context._scroll}" part="content"><slot></slot></div>${context._displayFooter ? block4(context, tags, suffix) : undefined}<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `;
  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<header class="ui5-popup-header-root" id="ui5-popup-header" part="header">${context.header.length ? block2(context, tags, suffix) : block3(context, tags, suffix)}</header>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="header"></slot>`;
  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<h2 class="ui5-popup-header-text">${(0, _LitRenderer.ifDefined)(context.headerText)}</h2>`;
  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.footer.length ? block5(context, tags, suffix) : undefined}`;
  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<footer class="ui5-popup-footer-root" part="footer"><slot name="footer"></slot></footer>`;
  var _default = block0;
  _exports.default = _default;
});