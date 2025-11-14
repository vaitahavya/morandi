'use client';

import { memo } from 'react';

type JsonLdProps = {
  data: Record<string, any> | Record<string, any>[];
};

function JsonLdComponent({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

const JsonLd = memo(JsonLdComponent);
export default JsonLd;

