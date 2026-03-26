import { test as base, APIRequestContext } from "@playwright/test";

type ApiFixture = {
  jpContext: APIRequestContext;
  djContext: APIRequestContext;
};

export const test = base.extend<ApiFixture>({
  jpContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "https://jsonplaceholder.typicode.com",
    });
    await use(context);
    await context.dispose();
  },
  djContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "https://dummyjson.com",
    });
    await use(context);
    await context.dispose();
  },
});

export { expect, APIResponse } from "@playwright/test";
