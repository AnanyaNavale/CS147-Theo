declare module "success-motivational-quotes" {
  interface Quote {
    body: string;
    by: string;
    category: string;
    id: string;
  }
  const quotes: {
    getQuote: () => Quote;
  };
  export default quotes;
}