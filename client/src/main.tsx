import "./index.css";
import "@radix-ui/themes/styles.css";
import "@suiet/wallet-kit/style.css";

import { Flex, Theme } from "@radix-ui/themes";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import WalletProviderWrapper from "./components/WalletProviderWrapper";
import { Nav } from "./components/Nav.tsx";
import { ChainContextProvider } from "./context/ChainContextProvider.tsx";
import Root from "./routes/root.tsx";
import Borrow from "./routes/borrow.tsx";
import Earn from "./routes/earn.tsx";
import Dashboard from "./routes/dashboard.tsx";

window.onunhandledrejection = (event) => {
  console.error("Unhandled promise rejection:", event.reason);
};

const rootNode = document.getElementById("root")!;
const root = createRoot(rootNode);
root.render(
  <Theme appearance="dark">
    <Router>
      <WalletProviderWrapper>
        <ChainContextProvider>
          <Flex direction="column">
            <Nav />
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/borrow" element={<Borrow />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Flex>
        </ChainContextProvider>
      </WalletProviderWrapper>
    </Router>
  </Theme>
);
