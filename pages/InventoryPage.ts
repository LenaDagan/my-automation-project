import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  private readonly page: Page;
  private readonly backpackAddToCartButton: Locator;
  readonly cartBadge: Locator; // Public so our test can assert against it

  constructor(page: Page) {
    this.page = page;
    this.backpackAddToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async addBackpackToCart() {
    await this.backpackAddToCartButton.click();
  }
}