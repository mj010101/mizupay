import { WalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { ReactNode } from "react";

export default function WalletProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <WalletProvider>{children}</WalletProvider>;
}
