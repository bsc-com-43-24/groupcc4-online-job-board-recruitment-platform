'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert } from 'antd';

/**
 * Explains a role-based redirect instead of leaving the user wondering why the
 * page they asked for never appeared.
 */
export default function DeniedAlert() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || searchParams.get('denied') !== '1') {
    return null;
  }

  return (
    <Alert
      type="warning"
      showIcon
      closable
      onClose={() => setDismissed(true)}
      message="You don't have access to that page"
      description="That area belongs to the other account type. You have been taken to your own dashboard."
      style={{ marginBottom: 16 }}
    />
  );
}
