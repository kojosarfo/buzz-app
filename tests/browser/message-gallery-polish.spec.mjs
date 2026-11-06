import { test, expect } from "./source-fixture.mjs";

// Real browser computed styles and pointer/focus behavior.
test("layout message presentation", async ({ page }) => {
  await page.goto("/tests/fixtures/message-gallery.html?accent=blue");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.colorMode = theme;
    }, theme);
    for (const id of ["table-links", "code-diff"]) {
      const bubble = page.locator(
        `[data-message-id="${id}"] [data-message-action-anchor]`,
      );
      await expect(bubble).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(bubble).toHaveCSS("padding-top", "0px");
    }
  }
});

// Browser line layout: a capsule that wraps to a line start meets the prose
// edge, and capsules sharing a line keep their word space.
test("wrapped mention capsules align with prose", async ({ page }) => {
  await page.goto("/tests/fixtures/message-gallery.html?group=references");
  await page.getByRole("button", { name: "Narrow preview" }).click();
  const roster = page
    .locator('[data-message-id="wrapped-mentions"] p')
    .filter({ has: page.locator("[data-mention-kind]") });
  for (const density of ["comfortable", "compact"]) {
    await page.evaluate((density) => {
      document.documentElement.dataset.messageDensity = density;
    }, density);
    const capsules = await roster.evaluate((paragraph) => {
      const edge = paragraph.getBoundingClientRect().left;
      return [...paragraph.querySelectorAll("[data-mention-kind]")].map(
        (capsule) => {
          const box = capsule.getBoundingClientRect();
          const sigil = capsule.querySelector("svg")?.getBoundingClientRect();
          return {
            top: Math.round(box.top),
            left: box.left,
            right: box.right,
            sigil: (sigil?.left ?? Number.NaN) - edge,
          };
        },
      );
    });
    const starts = capsules.filter(
      (capsule, index) => capsule.top > (capsules[index - 1]?.top ?? -1),
    );
    expect(starts.length, density).toBeGreaterThan(1);
    for (const { sigil } of starts)
      expect(Math.abs(sigil), density).toBeLessThan(0.5);
    for (const [index, capsule] of capsules.entries()) {
      const previous = capsules[index - 1];
      if (previous && previous.top === capsule.top)
        expect(capsule.left - previous.right, density).toBeGreaterThan(2);
    }
  }
});
