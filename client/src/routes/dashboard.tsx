import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  Section,
  IconButton,
  Progress,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  PlusIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { useDashboardData } from "../hooks/useDashboardData";
import { ChargeModal } from "../components/ChargeModal";
import { useCharge } from "../hooks/useCharge";
import { Footer } from "../components/Footer";

interface AssetCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  dollarValue?: string;
}

function AssetCard({
  label,
  value,
  change,
  isPositive = true,
  dollarValue,
}: AssetCardProps) {
  return (
    <Card
      size="3"
      style={{
        minWidth: "180px",
        background:
          "linear-gradient(135deg, rgba(77, 162, 255, 0.1) 0%, rgba(99, 201, 185, 0.2) 100%)",
        border: "1px solid rgba(77, 162, 255, 0.15)",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.2s, box-shadow 0.2s",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow =
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)";
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #4DA2FF 0%, #63C9B9 100%)",
        }}
      />
      <Flex direction="column" gap="2" style={{ padding: "8px 0" }}>
        <Flex align="center" gap="1">
          <Text
            size="2"
            weight="bold"
            style={{
              color: "#F1F7F7",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </Text>
          <IconButton size="1" variant="ghost" style={{ color: "#4DA2FF" }}>
            <InfoCircledIcon />
          </IconButton>
        </Flex>
        <Flex align="center" gap="2">
          <Heading
            size="8"
            weight="bold"
            style={{
              background: "linear-gradient(90deg, #4DA2FF, #63C9B9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Heading>
          {dollarValue && (
            <Text
              size="2"
              style={{
                color: "#CEE3E4",
                alignSelf: "flex-end",
                marginBottom: "7px",
              }}
            >
              (~{dollarValue})
            </Text>
          )}
        </Flex>
        {change && (
          <Text
            size="2"
            style={{
              color: isPositive ? "#63C9B9" : "var(--tomato-11)",
              fontWeight: "medium",
            }}
          >
            {value !== "-" ? (isPositive ? "+" : "") : ""}
            {change}
          </Text>
        )}
      </Flex>
    </Card>
  );
}

interface VaultCardProps {
  title: string;
  percentage: number;
  apy: string;
  amount: string;
  color: string;
  icon?: React.ReactNode;
  link?: string;
}

function VaultCard({
  title,
  percentage,
  apy,
  amount,
  color,
  link,
}: VaultCardProps) {
  const handleCardClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      style={{
        background: "rgba(1, 24, 41, 0.8)",
        border: `1px solid ${color}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: link ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -6px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow =
          "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
      }}
      onClick={handleCardClick}
    >
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Heading
            size="4"
            style={{
              color: color,
            }}
          >
            {title}
          </Heading>
          {link && (
            <span
              style={{
                color: color,
                display: "flex",
                alignItems: "center",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <ExternalLinkIcon width="18" height="18" />
            </span>
          )}
        </Flex>
        <Box>
          <Flex justify="between" mb="1">
            <Text size="2" style={{ color: "#F1F7F7" }}>
              Allocation
            </Text>
            <Text size="2" weight="bold" style={{ color: color }}>
              {percentage > 0 ? `${percentage}%` : "-"}
            </Text>
          </Flex>
          <Box
            style={{
              height: "8px",
              borderRadius: "4px",
              background: "var(--gray-4)",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${percentage}%`,
                background: color,
                borderRadius: "4px",
              }}
            />
          </Box>
        </Box>
        <Grid columns="2" gap="3" mt="2">
          <Box>
            <Text size="2" style={{ color: "#F1F7F7" }}>
              APY
            </Text>
            <Text size="3" weight="bold" style={{ color: color }}>
              {apy}
            </Text>
          </Box>
          <Box>
            <Text size="2" style={{ color: "#F1F7F7" }}>
              Amount
            </Text>
            <Text size="3" weight="bold" style={{ color: "#F1F7F7" }}>
              {amount}
            </Text>
          </Box>
        </Grid>
      </Flex>
    </Card>
  );
}

function Dashboard() {
  const { isConnected, assetData, yieldData, vaultData } = useDashboardData();
  const {
    isButtonDisabled,
    chargeModalOpen,
    setChargeModalOpen,
    handleOpenChargeModal,
    handleCharge,
  } = useCharge();

  return (
    <Box
      style={{
        background: "linear-gradient(135deg, var(--gray-2), var(--gray-1))",
        color: "#F1F7F7",
        minHeight: "100vh",
      }}
    >
      <Section
        size="3"
        style={{
          background: "linear-gradient(135deg, var(--gray-1), var(--gray-2))",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container mx="auto" size="3">
          <Flex justify="between" align="center">
            <Heading
              as="h1"
              size="8"
              style={{
                background: "linear-gradient(90deg, #4DA2FF, #63C9B9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dashboard
            </Heading>
            <Button
              size="3"
              disabled={isButtonDisabled}
              style={{
                background: "linear-gradient(45deg, #63C9B9, #2E5A5A)",
                borderRadius: "20px",
                color: "white",
                boxShadow: "0 4px 14px rgba(99, 201, 185, 0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
                opacity: isButtonDisabled ? "0.5" : "1",
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isButtonDisabled) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(99, 201, 185, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isButtonDisabled) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(99, 201, 185, 0.4)";
                }
              }}
              onClick={isButtonDisabled ? undefined : handleOpenChargeModal}
            >
              <PlusIcon style={{ marginRight: "4px" }} />
              Charge USDC
            </Button>
          </Flex>
        </Container>
      </Section>

      <Section
        size="3"
        style={{
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            size="5"
            style={{
              marginBottom: "24px",
              color: "#4DA2FF",
            }}
          >
            My Assets
          </Heading>
          <Grid columns={{ initial: "1", sm: "3" }} gap="6">
            <AssetCard
              label="LBTC Balance"
              value={assetData.LBTC.value}
              change={assetData.LBTC.change}
              isPositive={assetData.LBTC.isPositive}
              dollarValue={assetData.LBTC.dollarValue}
            />
            <AssetCard
              label="mzUSD Balance"
              value={assetData.mzUSD.value}
              change={assetData.mzUSD.change}
              isPositive={assetData.mzUSD.isPositive}
            />
            <AssetCard
              label="smzUSD Balance"
              value={assetData.smzUSD.value}
              change={assetData.smzUSD.change}
              isPositive={assetData.smzUSD.isPositive}
            />
          </Grid>
        </Container>
      </Section>

      <Section
        size="3"
        style={{
          background:
            "linear-gradient(180deg, rgba(192, 230, 255, 0.1) 0%, var(--gray-1) 100%)",
          paddingTop: "40px",
          paddingBottom: "40px",
          borderTop: "1px solid rgba(79, 70, 229, 0.1)",
          borderBottom: "1px solid rgba(79, 70, 229, 0.1)",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            size="5"
            style={{
              marginBottom: "24px",
              color: "#4DA2FF",
            }}
          >
            Accumulated Yield
          </Heading>
          <Grid columns={{ initial: "1", sm: "2" }} gap="6">
            <Card
              size="3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22, 46, 47, 0.9), rgba(1, 24, 41, 0.8))",
                border: "1px solid rgba(77, 162, 255, 0.15)",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "#4DA2FF",
                  }}
                >
                  Total Yield
                </Heading>
                <Heading
                  size="8"
                  style={{
                    background: "linear-gradient(90deg, #4DA2FF, #63C9B9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {yieldData.totalYield}
                </Heading>
                <Text style={{ color: "#F1F7F7" }}>Since January 2025</Text>
              </Flex>
            </Card>
            <Card
              size="3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22, 46, 47, 0.9), rgba(1, 24, 41, 0.8))",
                border: "1px solid rgba(77, 162, 255, 0.15)",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "#4DA2FF",
                  }}
                >
                  Current APY
                </Heading>
                <Heading
                  size="8"
                  style={{
                    background: "linear-gradient(90deg, #4DA2FF, #63C9B9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {yieldData.currentAPY}
                </Heading>
                <Text style={{ color: "#63C9B9" }}>
                  {yieldData.changeFromLastMonth}
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section
        size="3"
        style={{
          paddingTop: "40px",
          paddingBottom: "60px",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            size="5"
            style={{
              marginBottom: "12px",
              color: "#4DA2FF",
            }}
          >
            Staked mzUSD Management
          </Heading>

          <Flex direction="column" gap="40">
            <Text
              size="3"
              style={{
                color: "#F1F7F7",
              }}
            >
              Your staked mzUSD is distributed across multiple vaults to
              optimize yield and minimize risk.
            </Text>

            <Box>
              <Card
                size="3"
                style={{
                  background: "rgba(1, 24, 41, 0.8)",
                  border: "1px solid rgba(77, 162, 255, 0.3)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginTop: "24px",
                  marginBottom: "24px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Text size="2" weight="bold" style={{ color: "#F1F7F7" }}>
                    Relative Allocation
                  </Text>
                  <Box>
                    {isConnected ? (
                      <>
                        <Box
                          style={{
                            height: "20px",
                            width: "100%",
                            background: "var(--gray-4)",
                            borderRadius: "10px",
                            overflow: "hidden",
                            display: "flex",
                          }}
                        >
                          <Box
                            style={{
                              height: "100%",
                              width: `${vaultData.drift.percentage}%`,
                              background: "#4DA2FF",
                              borderRadius: "10px 0 0 10px",
                            }}
                          />
                          <Box
                            style={{
                              height: "100%",
                              width: `${vaultData.kamino.percentage}%`,
                              background: "#63C9B9",
                            }}
                          />
                          <Box
                            style={{
                              height: "100%",
                              width: `${vaultData.mzUSDPool.percentage}%`,
                              background: "#2E5A5A",
                              borderRadius: "0 10px 10px 0",
                            }}
                          />
                        </Box>

                        <Flex justify="between" mt="3">
                          <Text size="1" style={{ color: "#F1F7F7" }}>
                            0%
                          </Text>
                          <Text size="1" style={{ color: "#F1F7F7" }}>
                            25%
                          </Text>
                          <Text size="1" style={{ color: "#F1F7F7" }}>
                            50%
                          </Text>
                          <Text size="1" style={{ color: "#F1F7F7" }}>
                            75%
                          </Text>
                          <Text size="1" style={{ color: "#F1F7F7" }}>
                            100%
                          </Text>
                        </Flex>

                        <Flex justify="center" gap="4" mt="3">
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "#4DA2FF",
                                borderRadius: "2px",
                              }}
                            />
                            <Text size="1" style={{ color: "#4DA2FF" }}>
                              Drift ({vaultData.drift.percentage}%)
                            </Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "#63C9B9",
                                borderRadius: "2px",
                              }}
                            />
                            <Text size="1" style={{ color: "#63C9B9" }}>
                              Kamino ({vaultData.kamino.percentage}%)
                            </Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "#2E5A5A",
                                borderRadius: "2px",
                              }}
                            />
                            <Text size="1" style={{ color: "#2E5A5A" }}>
                              mzUSD ({vaultData.mzUSDPool.percentage}%)
                            </Text>
                          </Flex>
                        </Flex>
                      </>
                    ) : (
                      <Text style={{ color: "#F1F7F7" }}>
                        Connect wallet to view allocation distribution
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Card>

              <Grid columns={{ initial: "1", sm: "3" }} gap="6">
                <VaultCard
                  title="Drift Vault"
                  percentage={vaultData.drift.percentage}
                  apy={vaultData.drift.apy}
                  amount={vaultData.drift.amount}
                  color={vaultData.drift.color}
                  link="https://app.drift.trade/vaults/strategy-vaults"
                />
                <VaultCard
                  title="Kamino Vault"
                  percentage={vaultData.kamino.percentage}
                  apy={vaultData.kamino.apy}
                  amount={vaultData.kamino.amount}
                  color={vaultData.kamino.color}
                  link="https://app.kamino.finance/liquidity?search=zbtc&filter=all&sort=tvl"
                />
                <VaultCard
                  title="mzUSD Pool"
                  percentage={vaultData.mzUSDPool.percentage}
                  apy={vaultData.mzUSDPool.apy}
                  amount={vaultData.mzUSDPool.amount}
                  color={vaultData.mzUSDPool.color}
                  link="https://www.orca.so/pools?tokens=zBTCug3er3tLyffELcvDNrKkCymbPWysGcWihESYfLg"
                />
              </Grid>
            </Box>
          </Flex>
        </Container>
      </Section>

      <ChargeModal
        open={chargeModalOpen}
        onOpenChange={setChargeModalOpen}
        onCharge={handleCharge}
      />
      <Footer />
    </Box>
  );
}

export default Dashboard;
