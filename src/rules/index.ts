import type { Rule } from '../types/rule.js';

// Foundation
import { uAppExistsRule } from './foundation/u-app-exists.js';
import { errorBoundaryRule } from './foundation/error-boundary.js';
import { nuxtConfigModulesRule } from './foundation/nuxt-config-modules.js';
import { faviconPresentRule } from './foundation/favicon-present.js';
import { notFoundPageRule } from './foundation/not-found-page.js';
import { metadataConfiguredRule } from './foundation/metadata-configured.js';
import { colorModeConfiguredRule } from './foundation/color-mode-configured.js';

// Forms
import { uFormSchemaRule } from './forms/u-form-schema.js';
import { formErrorHandlingRule } from './forms/form-error-handling.js';
import { inputTypesPresentRule } from './forms/input-types-present.js';
import { placeholderNotLabelRule } from './forms/placeholder-not-label.js';
import { requiredFieldsMarkedRule } from './forms/required-fields-marked.js';
import { submitButtonPresentRule } from './forms/submit-button-present.js';

// Interaction
import { commandPaletteShortcutRule } from './interaction/command-palette-shortcut.js';
import { toastFeedbackPresentRule } from './interaction/toast-feedback-present.js';
import { mobileNavPresentRule } from './interaction/mobile-nav-present.js';
import { breadcrumbNavPresentRule } from './interaction/breadcrumb-nav-present.js';
import { modalConfirmationRule } from './interaction/modal-confirmation.js';
import { dropdownMenuPresentRule } from './interaction/dropdown-menu-present.js';

// States
import { skeletonOnFetchRule } from './states/skeleton-on-fetch.js';
import { errorStateHandledRule } from './states/error-state-handled.js';
import { emptyStatePresentRule } from './states/empty-state-present.js';
import { pendingUiFeedbackRule } from './states/pending-ui-feedback.js';
import { successFeedbackPresentRule } from './states/success-feedback-present.js';
import { transitionAnimationsPresentRule } from './states/transition-animations-present.js';

// Accessibility
import { buttonAriaLabelRule } from './a11y/button-aria-label.js';
import { imageAltPresentRule } from './a11y/image-alt-present.js';
import { formFieldLabelingRule } from './a11y/form-field-labeling.js';
import { headingHierarchyRule } from './a11y/heading-hierarchy.js';
import { skipLinkPresentRule } from './a11y/skip-link-present.js';
import { focusVisiblePresentRule } from './a11y/focus-visible-present.js';
import { keyboardNavAvailableRule } from './a11y/keyboard-nav-available.js';
import { srOnlyTextPresentRule } from './a11y/sr-only-text-present.js';

// Production
import { darkModeSupportRule } from './production/dark-mode-support.js';
import { noConsoleLogsRule } from './production/no-console-logs.js';
import { noHardcodedUrlsRule } from './production/no-hardcoded-urls.js';
import { noInlineStylesRule } from './production/no-inline-styles.js';
import { nuxtImageUsedRule } from './production/nuxt-image-used.js';
import { responsiveLayoutPresentRule } from './production/responsive-layout-present.js';

export const rules: Rule[] = [
  // Foundation
  uAppExistsRule,
  errorBoundaryRule,
  nuxtConfigModulesRule,
  faviconPresentRule,
  notFoundPageRule,
  metadataConfiguredRule,
  colorModeConfiguredRule,

  // Forms
  uFormSchemaRule,
  formErrorHandlingRule,
  inputTypesPresentRule,
  placeholderNotLabelRule,
  requiredFieldsMarkedRule,
  submitButtonPresentRule,

  // Interaction
  commandPaletteShortcutRule,
  toastFeedbackPresentRule,
  mobileNavPresentRule,
  breadcrumbNavPresentRule,
  modalConfirmationRule,
  dropdownMenuPresentRule,

  // States
  skeletonOnFetchRule,
  errorStateHandledRule,
  emptyStatePresentRule,
  pendingUiFeedbackRule,
  successFeedbackPresentRule,
  transitionAnimationsPresentRule,

  // Accessibility
  buttonAriaLabelRule,
  imageAltPresentRule,
  formFieldLabelingRule,
  headingHierarchyRule,
  skipLinkPresentRule,
  focusVisiblePresentRule,
  keyboardNavAvailableRule,
  srOnlyTextPresentRule,

  // Production
  darkModeSupportRule,
  noConsoleLogsRule,
  noHardcodedUrlsRule,
  noInlineStylesRule,
  nuxtImageUsedRule,
  responsiveLayoutPresentRule,
];
