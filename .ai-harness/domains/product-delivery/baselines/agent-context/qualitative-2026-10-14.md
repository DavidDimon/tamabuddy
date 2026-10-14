# Initial retrieval quality check — 2026-10-14

Method: run each baseline task through the repository retrieval workflow, then
compare the selected owner and excluded wrong turn with the matching manual
evaluation. This checks routing quality; it does not implement the example
requests.

| Baseline scenario       | Evaluation case                     | Observed owner/result                                             | Excluded wrong turn                          | Result |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- | ------ |
| desktop-change-location | Change the message after feeding    | `TamabuddyDesktopClient.acceptedMessage` presentation mapping     | Engine domain copy                           | Pass   |
| desktop-small-change    | Restyle the settings confirmation   | `features/settings` component, feature CSS, and focused tests     | Generic landing-page redesign                | Pass   |
| engine-domain-change    | Pet cannot play while sick          | `domain/rules/actions.ts` eligibility with engine-focused tests   | Disabled React button as authority           | Pass   |
| uncommitted-review      | Review an uncommitted React change  | Local severity review using code-smell and Ponytail review skills | Upstream response format or style-only notes | Pass   |
| desktop-roadmap         | Plan a complete showcase migration  | Outcome milestones with vertical proof and observable exits       | Flat file-move backlog                       | Pass   |
| desktop-visual-polish   | Polish the existing settings screen | Existing feature component/CSS under the desktop visual language  | Public-site treatment or remote imagery      | Pass   |

## Evidence

- Desktop current state identifies `TamabuddyDesktopClient` as the adapter for
  command-result messages; desktop extension points route status copy there.
- Desktop extension points keep settings and reset confirmation inside
  `features/settings`; `SettingsScreen` and its tests already cover the
  destructive confirmation and focus behavior.
- Engine `applyCareAction` rejects all non-cleaning/non-medicine commands while
  illness is active, so sickness eligibility remains a domain rule rather than
  a presentation condition.
- The local review skill preserves project severity and boundary rules while
  using the pinned Ponytail snapshot only as advisory review technique.
- The roadmap contract requires dependent outcomes and observable exit
  evidence; the roadmap skill explicitly prefers a vertical proof before broad
  migration.
- The visual language and design skill preserve the compact retro interface,
  accessibility, native window constraints, and feature-owned styling while
  rejecting generic marketing patterns.

All six retrieval checks reached the expected owner and avoided the protected
wrong turn. Together with the successful command run in
`initial-2026-10-14.md`, this satisfies the milestone 1 exit evidence.
