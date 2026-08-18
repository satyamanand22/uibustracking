/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { OperatorSession } from './types';

export default function App() {
  const [session, setSession] = useState<OperatorSession | null>(null);

  const handleLoginSuccess = (newSession: OperatorSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#051424]">
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        activeSession={session}
        onLogout={handleLogout}
      />
    </div>
  );
}

