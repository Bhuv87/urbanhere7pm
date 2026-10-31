import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import { LandingPage } from './components/LandingPage/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { SelectionHub } from './components/Portal/SelectionHub';
import { Onboarding } from './components/Onboarding';
import { Explore } from './components/Explore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { authService, supabase } from './utils/supabase';

export default function App() {
  const { stage, setStage, confirmSelection, setStreet, currentUser, setCurrentUser, openPortal } = useStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    useStore.getState().addBlackboxLog('ACTION: App loaded.');
    let mounted = true;
    const restoreAuth = async () => {
      let user = null;
      try {
        user = await authService.getCurrentUser();
      } catch (e) {
        console.warn('Auth session check failed:', e);
      }
      if (!mounted) return;
      setCurrentUser(user);
      setAuthReady(true);

      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('stage') === 'explore') {
        window.history.replaceState({}, '', window.location.pathname);
        if (user) confirmSelection();
        else setStage('auth');
      } else if (params.get('stage') === 'select' || params.get('wizard') === '1') {
        setStage(user ? 'select' : 'auth');
      } else if (params.get('stage') === 'auth' || params.get('login') === '1') {
        setStage(user && !authService.isPasswordRecovery() ? 'portal' : 'auth');
      } else if (params.get('stage') === 'portal' || params.get('hub') === '1') {
        setStage(user ? 'portal' : 'auth');
      }
    };
    void restoreAuth();
    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setStage('auth');
      }
    });
    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [confirmSelection, setStage, setCurrentUser]);

  return (
    <ErrorBoundary fallbackTitle="APPLICATION ENGINE SAFEGUARD">
      <div className="w-screen h-screen overflow-x-hidden bg-white text-black font-sans">
        {!authReady ? null : stage === 'landing' ? (
          <LandingPage
            onEnterApp={(streetId) => {
              if (streetId) {
                setStreet(streetId);
              }
              if (currentUser) {
                openPortal();
              } else {
                setStage('auth');
              }
            }}
            onOpenWizard={() => {
              if (currentUser) {
                setStage('select');
              } else {
                setStage('auth');
              }
            }}
          />
        ) : stage === 'auth' || !currentUser ? (
          <AuthPage />
        ) : stage === 'portal' ? (
          <SelectionHub
            onSelectLayout={(streetId) => {
              if (streetId) {
                setStreet(streetId);
              }
              confirmSelection();
            }}
            onOpenWizard={() => setStage('select')}
          />
        ) : stage === 'select' ? (
          <Onboarding />
        ) : (
          <Explore />
        )}
      </div>
    </ErrorBoundary>
  );
}
