import { test, expect, chromium } from '@playwright/test';

test.describe('Automation Audit - Emails patterns to unassign', () => {

  test('Functional test suite for email patterns field', async () => {
    test.setTimeout(120000);

    const userDataDir = './user_data';
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chrome',
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    // 1. Navigate to Guardians tab URL
    await page.goto('https://guardio.app.getnotch.dev/config/guardrails?version=e2e-draft-mt7d0e9wn0tx', {
      waitUntil: 'domcontentloaded',
    });

    const inputField = page.locator('textarea.sc-fUnMCh, textarea.sc-gQSkpc').first();
    await expect(inputField).toBeVisible({ timeout: 20000 });

    const initialSaveButton = page.getByTestId('config-save-button');

    // Robust Save & Confirm helper with explicit waiting for the specific Save button inside modal
    const saveAndConfirm = async () => {
      await expect(initialSaveButton).toBeVisible();
      await initialSaveButton.click();

      // 1. Wait for modal overlay to appear
      const modal = page.locator('.sc-knuQbY').first();
      await expect(modal).toBeVisible({ timeout: 10000 });
      
      // 2. Target exact modal Save button using provided classes
      const modalSaveBtn = modal.locator('button.sc-czkgLR, button.sc-gFqAkR, button:has-text("Save")').first();
      
      // 3. Wait explicitly for button to be visible and enabled before clicking
      await expect(modalSaveBtn).toBeVisible({ timeout: 10000 });
      await expect(modalSaveBtn).toBeEnabled({ timeout: 5000 });
      await modalSaveBtn.click();
      
      // 4. Confirm modal dismissed
      await expect(modal).not.toBeVisible({ timeout: 10000 });
    };

    // 2. Clear pre-existing chips if present
    const existingDeleteButtons = page.locator('button.sc-cvalOF, button:has-text("×")');
    const existingCount = await existingDeleteButtons.count();
    
    if (existingCount > 0) {
      for (let i = 0; i < existingCount; i++) {
        await existingDeleteButtons.first().click();
      }
      await saveAndConfirm();
      await page.waitForTimeout(1500);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(inputField).toBeVisible({ timeout: 15000 });
    }

    // 3. Verify Empty State
    await expect(inputField).toHaveValue('');

    // 4. Add custom pattern
    const specialPattern = 'user+test_123!@domain-name.co.il with spaces';
    await inputField.fill(specialPattern);
    await inputField.press('Enter');

    const specialChip = page.locator('div, span').filter({ hasText: specialPattern }).first();
    await expect(specialChip).toBeVisible({ timeout: 5000 });

    // 5. Save through modal & verify persistence across page refresh
    await saveAndConfirm();
    await page.waitForTimeout(1500);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('div, span').filter({ hasText: specialPattern }).first()).toBeVisible({ timeout: 15000 });

    // 6. Delete pattern to return to clean empty state
    const deleteBtn = page.locator('div, span').filter({ hasText: specialPattern }).locator('button.sc-cvalOF, button:has-text("×")').first();
    await deleteBtn.click();

    // 7. Save through modal & verify reset empty state
    await saveAndConfirm();
    await page.waitForTimeout(1500);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(inputField).toBeVisible({ timeout: 15000 });
    await expect(inputField).toHaveValue('');

    await context.close();
  });

});