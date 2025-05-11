import { CardStackIcon, PersonIcon } from "@radix-ui/react-icons";
import { Box, Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";

type ChargeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCharge: (amount: string, destination: "card" | "eoa") => void;
};

export function ChargeModal({
  open,
  onOpenChange,
  onCharge,
}: ChargeModalProps) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState<"card" | "eoa">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCharge = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onCharge(amount, destination);
      setIsProcessing(false);
      setAmount("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Charge USDC</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Top-up USDC with the yield from your Bitcoin. The yield is
          automatically converted to USDC from the zUSD pool.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <Box>
            <Text
              as="label"
              size="2"
              weight="bold"
              htmlFor="amount-input"
              mb="2"
            >
              Amount (zUSD)
            </Text>
            <Box mt="2">
              <TextField.Root
                id="amount-input"
                placeholder="0.0"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Box>
          </Box>

          <Box>
            <Text as="label" size="2" weight="bold">
              Destination
            </Text>
            <Box mt="2">
              <Flex gap="2">
                <Button
                  size="3"
                  style={{
                    flex: 1,
                    background:
                      destination === "card"
                        ? "linear-gradient(45deg, var(--jade-9), var(--mint-9))"
                        : "var(--gray-3)",
                    color: destination === "card" ? "white" : "var(--gray-11)",
                    border:
                      destination === "card"
                        ? "none"
                        : "1px solid var(--gray-6)",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setDestination("card")}
                >
                  <CardStackIcon style={{ marginRight: "8px" }} />
                  To Card (KAST)
                </Button>
                <Button
                  size="3"
                  style={{
                    flex: 1,
                    background:
                      destination === "eoa"
                        ? "linear-gradient(45deg, var(--jade-9), var(--mint-9))"
                        : "var(--gray-3)",
                    color: destination === "eoa" ? "white" : "var(--gray-11)",
                    border:
                      destination === "eoa"
                        ? "none"
                        : "1px solid var(--gray-6)",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setDestination("eoa")}
                >
                  <PersonIcon style={{ marginRight: "8px" }} />
                  To Account
                </Button>
              </Flex>
            </Box>
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleCharge}
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
              style={{
                background:
                  "linear-gradient(45deg, var(--jade-9), var(--mint-9))",
                color: "white",
              }}
            >
              {isProcessing ? "Processing..." : "Charge"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
