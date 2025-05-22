import { Badge, Box, DropdownMenu, Flex, Heading } from "@radix-ui/themes";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ChainContext } from "../context/ChainContext";
import { ConnectButton } from "@suiet/wallet-kit";

export function Nav() {
  const {
    displayName: currentChainName,
    chain,
    setChain,
  } = useContext(ChainContext);
  const currentChainBadge = (
    <Badge color="gray" style={{ verticalAlign: "middle" }}>
      {currentChainName}
    </Badge>
  );
  return (
    <Box
      style={{
        backgroundColor: "var(--gray-1)",
        borderBottom: "1px solid var(--gray-a4)",
        zIndex: 1,
        padding: "12px 24px",
        height: "80px",
      }}
      position="sticky"
      top="0"
    >
      <Flex gap="4" justify="between" align="center" height="100%">
        <Flex align="center" gap="2">
          <img
            src="/mizupay_logo.svg"
            alt="MizuPay Logo"
            width="144"
            height="38"
            style={{ marginRight: "8px" }}
          />
          <Heading as="h1" size={{ initial: "4", xs: "5" }} truncate>
            {setChain ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>{currentChainBadge}</DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.RadioGroup
                    onValueChange={(value) => {
                      setChain(value as `sui:${string}`);
                    }}
                    value={chain}
                  >
                    <DropdownMenu.RadioItem value="sui:devnet">
                      Sui Devnet
                    </DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem value="sui:testnet">
                      Sui Testnet
                    </DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem value="sui:mainnet">
                      Sui Mainnet
                    </DropdownMenu.RadioItem>
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              currentChainBadge
            )}
          </Heading>
        </Flex>

        <Flex gap="6" align="center">
          <Flex gap="5" display={{ initial: "none", md: "flex" }}>
            <Link
              to="/"
              style={{
                color: "var(--gray-12)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Home
            </Link>
            <Link
              to="https://www.lombard.finance/app/stake/"
              style={{
                color: "var(--gray-12)",
                textDecoration: "none",
                fontWeight: 500,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Deposit
            </Link>
            <Link
              to="/borrow"
              style={{
                color: "var(--gray-12)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Borrow
            </Link>
            <Link
              to="/earn"
              style={{
                color: "var(--gray-12)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Earn
            </Link>
            <Link
              to="/dashboard"
              style={{
                color: "var(--gray-12)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Dashboard
            </Link>
          </Flex>

          <Flex gap="2">
            <Box
              style={{
                overflow: "hidden",
                borderRadius: "20px",
                boxShadow: "0 4px 14px rgba(77, 162, 255, 0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
                width: "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(77, 162, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(77, 162, 255, 0.4)";
              }}
            >
              <ConnectButton
                style={{
                  background: "linear-gradient(45deg, #4DA2FF, #63C9B9)",
                  color: "white",
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "none",
                  minWidth: "120px",
                  width: "fit-content",
                }}
              >
                Connect Wallet
              </ConnectButton>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
