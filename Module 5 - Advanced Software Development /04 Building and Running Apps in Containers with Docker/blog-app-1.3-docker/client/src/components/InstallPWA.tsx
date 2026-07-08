import { useEffect, useState, type MouseEvent } from 'react';

// Define the beforeinstallprompt event type since it's non-standard
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async (evt: MouseEvent) => {
    evt.preventDefault();
    if (!promptInstall) return;

    // Show the install prompt
    await promptInstall.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await promptInstall.userChoice;
    
    // If accepted, we can hide the button
    if (outcome === 'accepted') {
      setSupportsPWA(false);
      setPromptInstall(null);
    }
  };

  if (!supportsPWA) return null;

  return (
    <button 
      onClick={onClick} 
      className="btn-secondary text-sm hidden md:block"
      aria-label="Install Progressive Web App"
    >
      Install App
    </button>
  );
}
