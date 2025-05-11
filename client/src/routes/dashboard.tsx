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
          "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
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
          background:
            "linear-gradient(90deg, var(--indigo-9) 0%, var(--purple-9) 100%)",
        }}
      />
      <Flex direction="column" gap="2" style={{ padding: "8px 0" }}>
        <Flex align="center" gap="1">
          <Text
            size="2"
            weight="bold"
            style={{
              color: "var(--gray-12)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </Text>
          <IconButton
            size="1"
            variant="ghost"
            style={{ color: "var(--indigo-9)" }}
          >
            <InfoCircledIcon />
          </IconButton>
        </Flex>
        <Flex align="center" gap="2">
          <Heading
            size="8"
            weight="bold"
            style={{
              background:
                "linear-gradient(90deg, var(--indigo-9), var(--purple-9))",
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
                color: "var(--gray-11)",
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
              color: isPositive ? "var(--jade-11)" : "var(--tomato-11)",
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
        background: "rgba(25, 25, 28, 0.8)",
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
            <Text size="2" style={{ color: "var(--gray-12)" }}>
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
            <Text size="2" style={{ color: "var(--gray-12)" }}>
              APY
            </Text>
            <Text size="3" weight="bold" style={{ color: color }}>
              {apy}
            </Text>
          </Box>
          <Box>
            <Text size="2" style={{ color: "var(--gray-12)" }}>
              Amount
            </Text>
            <Text size="3" weight="bold" style={{ color: "var(--gray-12)" }}>
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
        color: "var(--gray-12)",
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
                background:
                  "linear-gradient(90deg, var(--indigo-11), var(--purple-11))",
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
                background:
                  "linear-gradient(45deg, var(--jade-9), var(--mint-9))",
                borderRadius: "20px",
                color: "white",
                boxShadow: "0 4px 14px rgba(0, 160, 120, 0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
                opacity: isButtonDisabled ? "0.5" : "1",
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isButtonDisabled) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 160, 120, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isButtonDisabled) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(0, 160, 120, 0.4)";
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
              color: "var(--indigo-10)",
            }}
          >
            My Assets
          </Heading>
          <Grid columns={{ initial: "1", sm: "3" }} gap="6">
            <AssetCard
              label="zBTC Balance"
              value={assetData.zBTC.value}
              change={assetData.zBTC.change}
              isPositive={assetData.zBTC.isPositive}
              dollarValue={assetData.zBTC.dollarValue}
            />
            <AssetCard
              label="zUSD Balance"
              value={assetData.zUSD.value}
              change={assetData.zUSD.change}
              isPositive={assetData.zUSD.isPositive}
            />
            <AssetCard
              label="szUSD Balance"
              value={assetData.szUSD.value}
              change={assetData.szUSD.change}
              isPositive={assetData.szUSD.isPositive}
            />
          </Grid>
        </Container>
      </Section>

      <Section
        size="3"
        style={{
          background:
            "linear-gradient(180deg, var(--indigo-1) 0%, var(--gray-1) 100%)",
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
              color: "var(--indigo-10)",
            }}
          >
            Accumulated Yield
          </Heading>
          <Grid columns={{ initial: "1", sm: "2" }} gap="6">
            <Card
              size="3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--indigo-11)",
                  }}
                >
                  Total Yield
                </Heading>
                <Heading
                  size="8"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--jade-9), var(--mint-9))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {yieldData.totalYield}
                </Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  Since January 2025
                </Text>
              </Flex>
            </Card>
            <Card
              size="3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--indigo-11)",
                  }}
                >
                  Current APY
                </Heading>
                <Heading
                  size="8"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--indigo-9), var(--purple-9))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {yieldData.currentAPY}
                </Heading>
                <Text style={{ color: "var(--jade-11)" }}>
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
              color: "var(--indigo-9)",
            }}
          >
            Staked zUSD Management
          </Heading>

          <Flex direction="column" gap="40">
            <Text
              size="3"
              style={{
                color: "var(--gray-12)",
              }}
            >
              Your staked zUSD is distributed across multiple vaults to optimize
              yield and minimize risk.
            </Text>

            <Box>
              <Card
                size="3"
                style={{
                  background: "rgba(25, 25, 28, 0.8)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginTop: "24px",
                  marginBottom: "24px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Text
                    size="2"
                    weight="bold"
                    style={{ color: "var(--gray-12)" }}
                  >
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
                              background: "var(--indigo-11)",
                              borderRadius: "10px 0 0 10px",
                            }}
                          />
                          <Box
                            style={{
                              height: "100%",
                              width: `${vaultData.kamino.percentage}%`,
                              background: "var(--purple-11)",
                            }}
                          />
                          <Box
                            style={{
                              height: "100%",
                              width: `${vaultData.zUSDPool.percentage}%`,
                              background: "var(--violet-11)",
                              borderRadius: "0 10px 10px 0",
                            }}
                          />
                        </Box>

                        <Flex justify="between" mt="3">
                          <Text size="1" style={{ color: "var(--gray-12)" }}>
                            0%
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-12)" }}>
                            25%
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-12)" }}>
                            50%
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-12)" }}>
                            75%
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-12)" }}>
                            100%
                          </Text>
                        </Flex>

                        <Flex justify="center" gap="4" mt="3">
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "var(--indigo-11)",
                                borderRadius: "2px",
                              }}
                            />
                            <Text
                              size="1"
                              style={{ color: "var(--indigo-11)" }}
                            >
                              Drift ({vaultData.drift.percentage}%)
                            </Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "var(--purple-11)",
                                borderRadius: "2px",
                              }}
                            />
                            <Text
                              size="1"
                              style={{ color: "var(--purple-11)" }}
                            >
                              Kamino ({vaultData.kamino.percentage}%)
                            </Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Box
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "var(--violet-11)",
                                borderRadius: "2px",
                              }}
                            />
                            <Text
                              size="1"
                              style={{ color: "var(--violet-11)" }}
                            >
                              zUSD ({vaultData.zUSDPool.percentage}%)
                            </Text>
                          </Flex>
                        </Flex>
                      </>
                    ) : (
                      <Text style={{ color: "var(--gray-12)" }}>
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
                  title="zUSD Pool"
                  percentage={vaultData.zUSDPool.percentage}
                  apy={vaultData.zUSDPool.apy}
                  amount={vaultData.zUSDPool.amount}
                  color={vaultData.zUSDPool.color}
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
