import { useState } from "react";
import { useDashboardData } from "./useDashboardData";

export function useCharge() {
  const { isConnected } = useDashboardData();
  const [chargeModalOpen, setChargeModalOpen] = useState(false);

  const handleOpenChargeModal = () => {
    setChargeModalOpen(true);
  };

  const handleCharge = (amount: string, destination: "card" | "eoa") => {
    console.log(`Charging ${amount} ZUSD to ${destination}`);
    // Implement the actual charge logic here
  };

  return {
    isButtonDisabled: !isConnected,
    chargeModalOpen,
    setChargeModalOpen,
    handleOpenChargeModal,
    handleCharge,
  };
}
