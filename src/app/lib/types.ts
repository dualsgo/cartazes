export type PosterData = {
  description: string;
  priceFrom: string;
  priceFor: string;
  code: string;       // COD_PRODUTO (SAP)
  ean: string;        // EAN_PRODUTO_UNITARIO
  reference: string;
  paymentOption: 'normal' | 'installment';
  posterSubType: 'offer' | 'normal';
};

