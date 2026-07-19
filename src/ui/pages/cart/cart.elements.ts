export const CartElements = {
  // Cart table
  cartBody: '#tbodyid',
  cartRows: '#tbodyid tr',
  totalPrice: '#totalp',

  // Place Order modal
  placeOrderButton: '.btn-success',
  orderModal: '#orderModal',
  orderName: '#name',
  orderCountry: '#country',
  orderCity: '#city',
  orderCard: '#card',
  orderMonth: '#month',
  orderYear: '#year',
  purchaseButton: '#orderModal .btn-primary',
  closeOrderButton: '#orderModal .btn-secondary',

  // Confirmation modal
  confirmationModal: '.sweet-alert',
  confirmationHeading: '.sweet-alert h2',
  confirmationDetails: '.sweet-alert p.lead',
  confirmOkButton: '.sweet-alert .confirm',
} as const;