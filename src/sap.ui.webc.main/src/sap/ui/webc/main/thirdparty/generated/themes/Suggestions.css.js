sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/Suggestions.css",
    content: ".ui5-suggestions-popover{box-shadow:var(--sapContent_Shadow1)}.ui5-suggestions-popover::part(content),.ui5-suggestions-popover::part(header){padding:0}.ui5-suggestions-popover::part(footer){padding:0 1rem}.ui5-suggestions-popover [ui5-li-suggestion-item],.ui5-suggestions-popover [ui5-li]{height:var(--_ui5_list_item_dropdown_base_height)}"
  };
  _exports.default = _default;
});