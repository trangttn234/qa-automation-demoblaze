import productData from '../data/products.json';

export const ProductEndpoints = {
  entries: '/entries',
  byCategory: '/bycat',
} as const;

export enum ProductName {
  SAMSUNG_GALAXY_S6 = 'Samsung galaxy s6',
  NOKIA_LUMIA_1520 = 'Nokia lumia 1520',
  NEXUS_6 = 'Nexus 6',
  SAMSUNG_GALAXY_S7 = 'Samsung galaxy s7',
  HTC_ONE = 'HTC One M9',
  SONY_XPERIA = 'Sony xperia z5',
  SONY_VAIO_I5 = 'Sony vaio i5',
  SONY_VAIO_I7 = 'Sony vaio i7',
  MACBOOK_AIR = 'MacBook air',
  DELL_I7 = 'Dell i7 8gb',
  DELL_15 = '2017 Dell 15.6 Inch',
  MACBOOK_PRO = 'MacBook Pro',
  APPLE_MONITOR = 'Apple monitor 24',
  ASUS_MONITOR = 'ASUS Full HD',
}

interface ProductData {
  id: number;
  price: number;
  category: string;
}

export class ProductHelper {
  private static data: Record<string, ProductData> = productData;

  static getId(product: ProductName): number {
    return ProductHelper.data[product].id;
  }

  static getPrice(product: ProductName): number {
    return ProductHelper.data[product].price;
  }

  static getCategory(product: string): string {
    return ProductHelper.data[product]?.category || 'Phones';
  }
}