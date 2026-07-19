import { faker } from '@faker-js/faker';

export const CartEndpoints = {
  addToCart: '/addtocart',
  viewCart: '/viewcart',
  deleteCart: '/deletecart',
} as const;

export class OrderData {
  name: string;
  country: string;
  city: string;
  creditCard: string;
  month: string;
  year: string;

  constructor(overrides?: Partial<OrderData>) {
    this.name = overrides?.name ?? faker.person.fullName();
    this.country = overrides?.country ?? faker.location.country();
    this.city = overrides?.city ?? faker.location.city();
    this.creditCard =
      overrides?.creditCard ?? faker.finance.creditCardNumber();
    this.month =
      overrides?.month ??
      String(faker.number.int({ min: 1, max: 12 }));
    this.year = overrides?.year ?? '2026';
  }

  static valid(): OrderData {
    return new OrderData();
  }

  static withoutName(): OrderData {
    return new OrderData({ name: '' });
  }

  static withoutCard(): OrderData {
    return new OrderData({ creditCard: '' });
  }

  static empty(): OrderData {
    return new OrderData({
      name: '',
      country: '',
      city: '',
      creditCard: '',
      month: '',
      year: '',
    });
  }
}