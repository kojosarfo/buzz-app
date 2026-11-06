// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { clearView, writeView } from "../../shared/view-state";
import { useChannelDraft } from "./draft-places";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

it("rescans saved drafts only when a write can change where drafts wait", () => {
  const session = { scope: "relay:alice" };
  const { result } = renderHook(() => useChannelDraft(session, "room"));
  expect(result.current).toBe(false);
  const scans = vi.spyOn(Storage.prototype, "key");

  act(() => void writeView(session.scope, "scroll:room", { bottom: true }));
  expect(scans).not.toHaveBeenCalled();

  act(() => void writeView(session.scope, "draft:room", { text: "h" }));
  expect(result.current).toBe(true);
  scans.mockClear();

  act(() => void writeView(session.scope, "draft:room", { text: "hi" }));
  expect(scans).not.toHaveBeenCalled();
  expect(result.current).toBe(true);

  act(() => void writeView(session.scope, "draft:room", { text: " " }));
  expect(result.current).toBe(false);

  act(() => void writeView(session.scope, "draft:room", { text: "back" }));
  expect(result.current).toBe(true);
  act(() => clearView(session.scope, "draft:room"));
  expect(result.current).toBe(false);
});

it("marks a draft another window saved, from its storage event's key", () => {
  const session = { scope: "relay:alice" };
  const { result } = renderHook(() => useChannelDraft(session, "room"));
  const key = `buzz-view.v1:${JSON.stringify([session.scope, "draft:room"])}`;
  localStorage.setItem(key, JSON.stringify({ text: "from elsewhere" }));
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", { key, storageArea: localStorage }),
    );
  });
  expect(result.current).toBe(true);
});
