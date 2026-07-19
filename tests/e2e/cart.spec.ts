import { test, expect, injectAuthSession } from '../../../src/fixtures/test.fixture';
import { ProductName, ProductHelper } from '../../../src/common/models/product.model';
import { OrderData } from '../../../src/common/models/order.model';
import { Messages } from '../../../src/ui/utils/enums';
import { WaitHelper } from '../../../src/ui/utils/helpers/wait.helper';

test.describe('Cart E2E @cart @e2e @regression', () => {
  test.beforeEach(async ({ page, apiHelper, workerCredentials }) => {
    await apiHelper.deleteCart(workerCredentials.username);
    await injectAuthSession(page, apiHelper, workerCredentials);
  });

  test.afterEach(async ({ apiHelper, workerCredentials }) => {
    await apiHelper.deleteCart(workerCredentials.username);
  });

  test(
    'CRT-001: Verify product can be added to the cart successfully @smoke',
    async ({ homePage, productPage, cartPage }) => {
      const product = ProductName.SAMSUNG_GALAXY_S6;

      await test.step('Add product to cart', async () => {
        await homePage.navigate();
        await homePage.clickProduct(product);
        const alert = await productPage.addToCart();
        expect(alert).toBe(Messages.MESSAGE_PRODUCT_ADDED);
      });

      await test.step('Verify product appears in cart', async () => {
        await cartPage.navigate();
        const items = await cartPage.getCartItems();

        expect(items.length).toBe(1);
        expect(items[0].title).toBe(product);
        expect(items[0].price).toBe(ProductHelper.getPrice(product));
      });
    }
  );

  test(
    'CRT-002: Verify multiple category products can be added to the cart successfully @demo',
    async ({ homePage, productPage, cartPage }) => {
      const product1 = ProductName.NOKIA_LUMIA_1520;
      const product3 = ProductName.MACBOOK_PRO;

      await test.step('Add products from multiple categories', async () => {
        for (const product of [product1, product1, product3]) {
          await homePage.navigate();
          await homePage.clickProduct(product);
          const alert = await productPage.addToCart();
          expect(alert).toBe(Messages.MESSAGE_PRODUCT_ADDED);
        }
      });

      await test.step('Verify cart contents and total', async () => {
        await cartPage.navigate();
        const items = await cartPage.getCartItems();

        expect(items.length).toBeGreaterThanOrEqual(2);

        const total = await cartPage.getTotal();
        const sumOfItems = items.reduce((sum, item) => sum + item.price, 0);

        expect(total).toBe(sumOfItems);

        for (const item of items) {
          expect(item.price).toBeGreaterThan(0);
          expect(item.title).toBeTruthy();
        }
      });
    }
  );

  test(
    'CRT-003: Verify order can be placed successfully @smoke',
    async ({ homePage, productPage, cartPage }) => {
      const product = ProductName.HTC_ONE;
      const order = OrderData.valid();

      await test.step('Add product to cart', async () => {
        await homePage.navigate();
        await homePage.clickProduct(product);
        await productPage.addToCart();
      });

      await test.step('Submit purchase order', async () => {
        await cartPage.navigate();
        await cartPage.placeOrder(order);
        const alert = await cartPage.clickPurchase();
        expect(alert).toBeNull();
      });

      await test.step('Validate purchase confirmation', async () => {
        const heading = await cartPage.getConfirmationHeading();
        expect(heading).toContain(Messages.MESSAGE_PURCHASE_SUCCESS);

        const details = await cartPage.getConfirmationDetails();
        expect(details).toContain(order.name);
        expect(details).toContain(order.creditCard);
      });

      await test.step('Confirm cart is empty after purchase', async () => {
        await cartPage.confirmPurchase();
        await cartPage.navigate();
        expect(await cartPage.isCartEmpty()).toBe(true);
      });
    }
  );

  test(
    'CRT-004: Verify an order containing products from multiple categories can be placed successfully @demo',
    async ({ homePage, productPage, cartPage }) => {
      const phone = ProductName.SAMSUNG_GALAXY_S6;
      const laptop = ProductName.MACBOOK_AIR;
      const monitor = ProductName.APPLE_MONITOR;
      const order = OrderData.valid();

      await test.step('Add products from multiple categories', async () => {
        for (const product of [phone, laptop, monitor]) {
          await homePage.navigate();
          await homePage.clickProduct(product);
          await productPage.addToCart();
        }

        await cartPage.navigate();
        const items = await cartPage.getCartItems();
        expect(items.length).toBe(3);
      });

      await test.step('Submit purchase order', async () => {
        await cartPage.placeOrder(order);
        const alert = await cartPage.clickPurchase();
        expect(alert).toBeNull();
      });

      await test.step('Validate purchase confirmation', async () => {
        const heading = await cartPage.getConfirmationHeading();
        expect(heading).toContain(Messages.MESSAGE_PURCHASE_SUCCESS);

        const details = await cartPage.getConfirmationDetails();
        expect(details).toContain(order.name);
        expect(details).toContain(order.creditCard);
      });

      await test.step('Confirm cart is empty after purchase', async () => {
        await cartPage.confirmPurchase();
        await cartPage.navigate();
        expect(await cartPage.isCartEmpty()).toBe(true);
      });
    }
  );

  test(
    'CRT-005: Verify cart items can be removed successfully',
    async ({ homePage, productPage, cartPage }) => {
      const product1 = ProductName.SAMSUNG_GALAXY_S6;
      const product2 = ProductName.NEXUS_6;

      await test.step('Add two products to cart', async () => {
        await homePage.navigate();
        await homePage.clickProduct(product1);
        await productPage.addToCart();

        await homePage.navigate();
        await homePage.clickProduct(product2);
        await productPage.addToCart();
      });

      await test.step('Remove first product and verify remaining item', async () => {
        await cartPage.navigate();
        await cartPage.deleteItem(product1);

        const items = await cartPage.getCartItems();
        expect(items.length).toBe(1);
        expect(items[0].title).toBe(product2);

        const total = await cartPage.getTotal();
        expect(total).toBe(ProductHelper.getPrice(product2));
      });

      await test.step('Remove last product and verify empty cart', async () => {
        await cartPage.deleteItem(product2);
        expect(await cartPage.isCartEmpty()).toBe(true);
      });
    }
  );

  test(
    'CRT-006: Verify order cannot be placed when required fields are empty @demo',
    async ({ homePage, productPage, cartPage }) => {
      await test.step('Add a product to the cart', async () => {
        await homePage.navigate();
        await homePage.clickProduct(ProductName.DELL_I7);
        await productPage.addToCart();
        await cartPage.navigate();
      });

      await test.step('Reject checkout with all fields empty', async () => {
        await cartPage.placeOrder(OrderData.empty());
        const alert = await cartPage.clickPurchase();
        expect(alert).toBe(Messages.MESSAGE_ORDER_EMPTY_FIELDS);
      });

      await test.step('Reject checkout with missing name', async () => {
        await cartPage.cancelOrder();
        await cartPage.placeOrder(OrderData.withoutName());
        const alert = await cartPage.clickPurchase();
        expect(alert).toBe(Messages.MESSAGE_ORDER_EMPTY_FIELDS);
      });

      await test.step('Reject checkout with missing credit card', async () => {
        await cartPage.cancelOrder();
        await cartPage.placeOrder(OrderData.withoutCard());
        const alert = await cartPage.clickPurchase();
        expect(alert).toBe(Messages.MESSAGE_ORDER_EMPTY_FIELDS);
      });
    }
  );

  test(
    'CRT-007: Verify purchase order can be cancelled',
    async ({ homePage, productPage, cartPage }) => {
      const product = ProductName.MACBOOK_PRO;

      await test.step('Add product to cart', async () => {
        await homePage.navigate();
        await homePage.clickProduct(product);
        await productPage.addToCart();
      });

      await test.step('Open then cancel the order form', async () => {
        await cartPage.navigate();
        await cartPage.placeOrder(OrderData.valid());
        await cartPage.cancelOrder();
      });

      await test.step('Verify cart still holds the product', async () => {
        const items = await cartPage.getCartItems();
        expect(items.length).toBe(1);
        expect(items[0].title).toBe(product);
      });
    }
  );

  test(
    'CRT-008: Verify cart items persist after navigation and page refresh',
    async ({ homePage, productPage, cartPage, page }) => {
      const product = ProductName.SAMSUNG_GALAXY_S6;

      const { itemsBefore, totalBefore } = await test.step(
        'Add product and capture cart baseline',
        async () => {
          await homePage.navigate();
          await homePage.clickProduct(product);
          await productPage.addToCart();

          await cartPage.navigate();
          const itemsBefore = await cartPage.getCartItems();
          const totalBefore = await cartPage.getTotal();

          expect(itemsBefore.length).toBe(1);
          expect(itemsBefore[0].title).toBe(product);

          return { itemsBefore, totalBefore };
        }
      );

      await test.step('Verify cart persists after navigation', async () => {
        await homePage.navigate();
        await cartPage.navigate();

        const itemsAfterNav = await cartPage.getCartItems();
        expect(itemsAfterNav.length).toBe(itemsBefore.length);
        expect(itemsAfterNav[0].title).toBe(product);
        expect(await cartPage.getTotal()).toBe(totalBefore);
      });

      await test.step('Verify cart persists after page refresh', async () => {
        await page.reload();
        await WaitHelper.forPageLoad(page);

        const itemsAfterRefresh = await cartPage.getCartItems();
        expect(itemsAfterRefresh.length).toBe(itemsBefore.length);
        expect(itemsAfterRefresh[0].title).toBe(product);
        expect(await cartPage.getTotal()).toBe(totalBefore);
      });
    }
  );
});