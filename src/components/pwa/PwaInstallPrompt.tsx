import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandaloneDisplay(): boolean {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 768px)").matches;
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

const PwaInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIosDialog, setShowIosDialog] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const copy = useMemo(
    () => ({
      button: "Instalar aplicativo",
      title: "Instalar VeloTech",
      description: "No iPhone, use o menu de compartilhamento do Safari e toque em Adicionar à Tela de Início.",
      stepOne: "Toque no ícone de compartilhar.",
      stepTwo: "Escolha Adicionar à Tela de Início.",
      close: "Entendi",
    }),
    []
  );

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
    setIsMobile(isMobileViewport());

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const updateMobileState = () => setIsMobile(mobileQuery.matches);
    mobileQuery.addEventListener("change", updateMobileState);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mobileQuery.removeEventListener("change", updateMobileState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const shouldShowPrompt =
    isMobile && !isStandalone && !dismissed && (Boolean(installPrompt) || isIosDevice());

  if (!shouldShowPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
        setInstallPrompt(null);
        setDismissed(true);
      }

      return;
    }

    setShowIosDialog(true);
  };

  return (
    <>
      <div className="fixed bottom-6 left-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-primary/30 bg-background/95 px-3 py-2 text-foreground shadow-xl backdrop-blur-md sm:hidden">
        <Button size="sm" variant="yellow" className="h-9 rounded-full px-3" onClick={handleInstallClick}>
          <Download className="mr-2 h-4 w-4" />
          {copy.button}
        </Button>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Fechar convite de instalacao"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              {copy.title}
            </DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-center gap-3 rounded-md bg-muted p-3">
              <Share2 className="h-5 w-5 text-primary" />
              <span>{copy.stepOne}</span>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted p-3">
              <Download className="h-5 w-5 text-primary" />
              <span>{copy.stepTwo}</span>
            </div>
          </div>
          <Button variant="yellow" onClick={() => setShowIosDialog(false)}>
            {copy.close}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PwaInstallPrompt;
