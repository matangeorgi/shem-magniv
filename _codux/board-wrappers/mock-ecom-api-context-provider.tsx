import { faker } from '@faker-js/faker';
import React, { FC, useMemo, useState } from 'react';
import { SWRConfig } from 'swr';
import type { EcomAPI } from '~/api/types';
import { EcomAPIContext } from '~/api/ecom-api-context-provider';
import {
    createCart,
    createOrder,
    createCategory,
    createProduct,
    createProducts,
    getCartTotals,
    FakeDataSettings as Settings,
} from '../mocks/fakers';

export type FakeDataSettings = Settings;

function getEcomApi(settings?: Settings): EcomAPI {
    faker.seed(123);
    const products = createProducts(settings);

    const api: EcomAPI = {
        getProductsByCategory: () => {
            return Promise.resolve({
                status: 'success',
                body: { items: products, totalCount: products.length },
            });
        },
        getProductBySlug: async (slug: string | undefined) => {
            faker.seed(123);
            return Promise.resolve({
                status: 'success',
                body: createProduct({ slug, settings }),
            });
        },
        getPromotedProducts: async () => {
            return Promise.resolve({
                status: 'success',
                body: products.slice(0, 4),
            });
        },
        getCart: () => {
            faker.seed(123);
            const productsInCart =
                settings?.numberOfCartItems === 0
                    ? []
                    : products.slice(0, settings?.numberOfCartItems ?? 2);
            return Promise.resolve({
                status: 'success',
                body: createCart(productsInCart),
            });
        },
        getCartTotals: () => {
            faker.seed(123);
            return Promise.resolve({
                status: 'success',
                body: getCartTotals(),
            });
        },
        addToCart: (id: string, quantity: number) => {
            console.log(`Mock Ecom API: add item id: ${id} to cart with quantity ${quantity}`);
            return api.getCart();
        },
        updateCartItemQuantity: (id: string | undefined | null, quantity: number) => {
            console.log(`Mock Ecom API: update cart item id: ${id} to quantity ${quantity}`);
            return api.getCart();
        },
        removeItemFromCart: (id: string) => {
            console.log(`Mock Ecom API: remove item id: ${id}`);
            return api.getCart();
        },
        checkout: () => {
            console.log('Mock Ecom API: checkout');
            return Promise.resolve({ status: 'success', body: { checkoutUrl: '' } });
        },
        getAllCategories: () => {
            return Promise.resolve({
                status: 'success',
                body: [createCategory(settings)],
            });
        },
        getCategoryBySlug: () => {
            return Promise.resolve({
                status: 'success',
                body: createCategory(settings),
            });
        },
        getOrder: (id: string) => {
            return Promise.resolve({
                status: 'success',
                body: createOrder(id),
            });
        },
        getProductPriceBounds: () => {
            return Promise.resolve({
                status: 'success',
                body: { lowest: 0, highest: 100 },
            });
        },
    };

    return api;
}

export const MockEcomAPIContextProvider: FC<{
    children: React.ReactElement;
    settings?: Settings;
}> = ({ children, settings }) => {
    const [cache, setCache] = useState(new Map());
    const api = useMemo(() => {
        setCache(new Map());
        return getEcomApi(settings);
    }, [settings]);

    return (
        <SWRConfig value={{ provider: () => cache }}>
            <EcomAPIContext.Provider value={api}>{children}</EcomAPIContext.Provider>
        </SWRConfig>
    );
};
