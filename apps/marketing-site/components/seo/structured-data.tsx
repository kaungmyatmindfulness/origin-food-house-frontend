export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Origin Food House',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '99',
      highPrice: '299',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description:
      'All-in-one restaurant management platform with QR ordering, kitchen display system, and analytics.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
