'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState('/admin');
  
  useEffect(() => {
    // Get the redirectTo parameter from the URL if it exists
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo) {
      setRedirectPath(redirectTo);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <LoginForm redirectPath={redirectPath} />
    </div>
  );
}
