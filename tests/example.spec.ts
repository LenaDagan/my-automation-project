import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test('Login and add item to cart using Page Object Model', async ({ page }) => {
  // Instantiate the page objects
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  // Execute steps using clean class methods
  await loginPage.navigateTo();
  await loginPage.login('standard_user', 'secret_sauce');

  // Verify successful transition
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

  // Perform inventory actions
  await inventoryPage.addBackpackToCart();

  // Handle assertions cleanly at the test level
  await expect(inventoryPage.cartBadge).toHaveText('1');
});