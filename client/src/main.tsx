import "./index.css";
import "@radix-ui/themes/styles.css";

import { Flex, Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Nav } from "./components/Nav.tsx";
import { ChainContextProvider } from "./context/ChainContextProvider.tsx";
import { RpcContextProvider } from "./context/RpcContextProvider.tsx";
import { SelectedWalletAccountContextProvider } from "./context/SelectedWalletAccountContextProvider.tsx";
import Root from "./routes/root.tsx";
import Mint from "./routes/mint.tsx";
import Earn from "./routes/earn.tsx";
import Deposit from "./routes/deposit.tsx";
import Dashboard from "./routes/dashboard.tsx";

const rootNode = document.getElementById("root")!;
const root = createRoot(rootNode);
root.render(
  <StrictMode>
    <Theme appearance="dark">
      <Router>
        <ChainContextProvider>
          <SelectedWalletAccountContextProvider>
            <RpcContextProvider>
              <Flex direction="column">
                <Nav />

                <Routes>
                  <Route path="/" element={<Root />} />
                  <Route path="/mint" element={<Mint />} />
                  <Route path="/earn" element={<Earn />} />
                  <Route path="/deposit" element={<Deposit />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </Flex>
            </RpcContextProvider>
          </SelectedWalletAccountContextProvider>
        </ChainContextProvider>
      </Router>
    </Theme>
  </StrictMode>
);
