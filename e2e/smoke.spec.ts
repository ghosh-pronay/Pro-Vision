import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Pro-Vision/)
  })

  test("shows main heading", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/")
    const authLink = page.getByRole("link", {
      name: /sign in|login|get started/i,
    })
    await expect(authLink.first()).toBeVisible()
  })
})

test.describe("Auth Page", () => {
  test("loads auth page", async ({ page }) => {
    await page.goto("/auth")
    await expect(page.locator("h2").first()).toBeVisible()
  })
})

test.describe("Responsive", () => {
  test("mobile viewport loads", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await expect(page).toHaveTitle(/Pro-Vision/)
  })

  test("desktop viewport loads", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await expect(page).toHaveTitle(/Pro-Vision/)
  })
})
