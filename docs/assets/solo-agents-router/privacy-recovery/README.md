# Solo Agents Router privacy recovery

Fictional preview captures from the plugin storage-recovery fix (commit b430e03b7) against app b7e92e43ff56adcebbe73a7abf99f188a02af9cb. All32 visual checks pass in WebKit and Chromium, covering default/enabled/failed-save/unreadable states at wide/narrow widths, dark theme and150% text. Chromium shows keyboard focus; error messages scroll into view at enlarged text.

The unreadable state deliberately retains an enabled local-instructions preference while chat-context storage is malformed. Instructions remain visibly on and can be revoked; only the unreadable context permission defaults off. Mounted behavior tests verify that repairing context cannot restore a revoked instruction permission. These preview screenshots do not validate native storage or real provider behavior.
