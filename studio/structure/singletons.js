// Singleton document types — exactly one document each. Shared between the
// desk structure (to render them as a single editable doc) and the studio
// config (to strip create/delete actions + hide from the global create menu).
export const singletonTypes = new Set([
  "siteSettings",
  "homePage",
  "aboutPage",
  "scheduleSettings",
]);

// Actions a singleton IS allowed to keep (everything else — create, delete,
// duplicate — is removed).
export const singletonActions = new Set([
  "publish",
  "discardChanges",
  "restore",
]);
