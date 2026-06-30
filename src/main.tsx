import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerServiceWorker";
import { initializeBrowserDatabase } from "./lib/browserDatabase";

async function bootstrap() {
  await initializeBrowserDatabase();
  createRoot(document.getElementById("root")!).render(<App />);
  registerServiceWorker();
}

void bootstrap().catch((error) => {
  console.error("Falha ao iniciar a aplicacao:", error);
  const root = document.getElementById("root");
  if (root) root.textContent = "Nao foi possivel iniciar o armazenamento local.";
});
