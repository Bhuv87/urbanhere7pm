import React, { useEffect } from 'react';
import { useStore } from './store';
import { LandingPage } from './components/LandingPage/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { SelectionHub } from './components/Portal/SelectionHub';
import { Onboarding } from './components/Onboarding';
import { Explore } from './components/Explore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { authService } from './utils/supabase';

export default function App() {
  const { stage, setStage, confirmSelection, setStreet, currentUser, setCurrentUser, openPortal } = useStore();

  useEffect(() => {
    // Restore session on mount
    const restoreAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.warn('Auth restore note:', e);
      }
    };
    restoreAuth();

    // URL parameter handlers
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('stage') === 'explore') {
      window.history.replaceState({}, '', window.location.pathname);
      confirmSelection();
    } else if (params.get('stage') === 'select' || params.get('wizard') === '1') {
      setStage('select');
    } else if (params.get('stage') === 'auth' || params.get('login') === '1') {
      setStage('auth');
    } else if (params.get('stage') === 'portal' || params.get('hub') === '1') {
      setStage('portal');
    }
  }, [confirmSelection, setStage, setCurrentUser]);

  return (
    <ErrorBoundary fallbackTitle="APPLICATION ENGINE SAFEGUARD">
      <div className="w-screen h-screen overflow-x-hidden bg-white text-black font-sans">
        {stage === 'landing' ? (
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
        ) : stage === 'auth' ? (
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
