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
} from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { InfoCircledIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Footer } from "../components/Footer";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
}

function MetricCard({ label, value, description }: MetricCardProps) {
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
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
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
              color: "var(--indigo-11)",
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
        <Heading
          size="8"
          weight="bold"
          style={{
            background:
              "linear-gradient(90deg, var(--indigo-9), var(--purple-9))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "4px",
          }}
        >
          {value}
        </Heading>
        {description && (
          <Text size="2" style={{ color: "var(--gray-12)" }}>
            {description}
          </Text>
        )}
      </Flex>
    </Card>
  );
}

function Root() {
  return (
    <Box
      style={{
        background: "linear-gradient(135deg, var(--gray-2), var(--gray-1))",
        color: "var(--gray-12)",
      }}
    >
      {/* Hero Section */}
      <Section
        size="3"
        style={{
          background: "linear-gradient(135deg, var(--gray-1), var(--gray-2))",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <Container mx="auto" size="3" style={{ padding: "0 48px" }}>
          <Grid
            columns={{ initial: "1", md: "2" }}
            gap={{ initial: "6", md: "24" }}
          >
            {/* Left: Text content */}
            <Flex direction="column" justify="center" gap="6">
              <Heading
                as="h1"
                size={{ initial: "9", xs: "9" }}
                style={{
                  maxWidth: "800px",
                  background:
                    "linear-gradient(90deg, var(--indigo-11), var(--purple-11))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: "1.1",
                }}
              >
                Earn, Pay, and Live with your Bitcoin
              </Heading>

              <Text
                size={{ initial: "7", xs: "7" }}
                style={{
                  maxWidth: "800px",
                  background:
                    "linear-gradient(90deg, var(--indigo-9), var(--purple-9))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "500",
                  marginTop: "-8px",
                }}
              >
                Powered by zBTC
              </Text>

              <Text
                size={{ initial: "4", xs: "5" }}
                style={{
                  maxWidth: "600px",
                  color: "var(--gray-12)",
                }}
              >
                zUSD: the foremost yield-bearing stablecoin on Solana. Fully
                backed by Bitcoin.
              </Text>

              <Flex gap="4" mt="4">
                <Button
                  size="3"
                  style={{
                    background:
                      "linear-gradient(45deg, var(--indigo-9), var(--purple-9))",
                    borderRadius: "20px",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(79, 70, 229, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(79, 70, 229, 0.4)";
                  }}
                >
                  <Link
                    to="/mint"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Deposit Now
                    <ExternalLinkIcon style={{ marginLeft: "4px" }} />
                  </Link>
                </Button>
              </Flex>
            </Flex>

            {/* Right: Visual element */}
            <Box
              style={{
                position: "relative",
                minHeight: "300px",
                marginLeft: "40px",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  right: "0",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                {/* Blockchain visual elements */}
                <Box
                  style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    background: "rgba(99, 102, 241, 0.15)",
                    borderRadius: "24px",
                    bottom: "60px",
                    right: "50px",
                    boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
                    transform: "rotate(-15deg)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-15deg) scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 40px rgba(99, 102, 241, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(-15deg)";
                    e.currentTarget.style.boxShadow =
                      "0 0 30px rgba(99, 102, 241, 0.3)";
                  }}
                >
                  <Text
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "var(--indigo-11)",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    zBTC
                  </Text>
                </Box>

                <Box
                  style={{
                    position: "absolute",
                    width: "140px",
                    height: "140px",
                    background: "rgba(147, 51, 234, 0.15)",
                    borderRadius: "24px",
                    top: "40px",
                    left: "80px",
                    boxShadow: "0 0 30px rgba(147, 51, 234, 0.3)",
                    transform: "rotate(10deg)",
                    border: "1px solid rgba(147, 51, 234, 0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(10deg) scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 40px rgba(147, 51, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(10deg)";
                    e.currentTarget.style.boxShadow =
                      "0 0 30px rgba(147, 51, 234, 0.3)";
                  }}
                >
                  <Text
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "var(--purple-11)",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    zUSD
                  </Text>
                </Box>

                <Box
                  style={{
                    position: "absolute",
                    width: "100px",
                    height: "100px",
                    background: "rgba(59, 130, 246, 0.15)",
                    borderRadius: "24px",
                    top: "160px",
                    right: "120px",
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                    transform: "rotate(-5deg)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-5deg) scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 40px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(-5deg)";
                    e.currentTarget.style.boxShadow =
                      "0 0 30px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  <Text
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "var(--blue-11)",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    SOLANA
                  </Text>
                </Box>

                {/* Connection lines */}
                <Box
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    opacity: 0.4,
                    background:
                      "linear-gradient(135deg, transparent, var(--indigo-6), transparent, var(--purple-6), transparent)",
                  }}
                ></Box>
              </Box>
            </Box>
          </Grid>
        </Container>
      </Section>

      {/* Metrics Section */}
      <Section
        size="3"
        style={{
          background:
            "linear-gradient(180deg, var(--gray-2) 0%, var(--gray-1) 100%)",
          paddingTop: "40px",
          paddingBottom: "60px",
          borderTop: "1px solid rgba(79, 70, 229, 0.2)",
          borderBottom: "1px solid rgba(79, 70, 229, 0.2)",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            size="5"
            align="center"
            style={{
              marginBottom: "32px",
              color: "var(--indigo-10)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Key Metrics
          </Heading>
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="6">
            <MetricCard
              label="TVL"
              value="$1.2B+"
              description="Total Value Locked"
            />
            <MetricCard
              label="APY"
              value="15.2%"
              description="Annual Percentage Yield"
            />
            <MetricCard
              label="Users"
              value="45,000+"
              description="Global Users"
            />
          </Grid>
        </Container>
      </Section>

      {/* Features Section */}
      <Section
        size="3"
        style={{
          background: "linear-gradient(135deg, var(--gray-2), var(--gray-1))",
          paddingTop: "60px",
          paddingBottom: "80px",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            size="6"
            style={{
              color: "var(--gray-12)",
              marginBottom: "32px",
              background:
                "linear-gradient(90deg, var(--indigo-11), var(--purple-11))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            Our Features
          </Heading>
          <Grid columns={{ initial: "1", sm: "2" }} gap="6">
            <Card
              style={{
                background: "rgba(25, 25, 28, 0.8)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
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
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--indigo-9)",
                  }}
                >
                  Asset Locking & Minting
                </Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  Lock zBTC as collateral and mint zUSD with a 70% LTV ratio
                </Text>
              </Flex>
            </Card>

            <Card
              style={{
                background: "rgba(25, 25, 28, 0.8)",
                border: "1px solid rgba(147, 51, 234, 0.3)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
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
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--purple-9)",
                  }}
                >
                  Staking Rewards
                </Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  Convert BTC to zBTC or zUSD to szUSD to earn staking rewards
                  up to 15%
                </Text>
              </Flex>
            </Card>

            <Card
              style={{
                background: "rgba(25, 25, 28, 0.8)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
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
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--blue-9)",
                  }}
                >
                  Solana and Bitcoin Wallet Support
                </Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  50+ Solana and Bitcoin Wallets Supported
                </Text>
              </Flex>
            </Card>

            <Card
              style={{
                background: "rgba(25, 25, 28, 0.8)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
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
            >
              <Flex direction="column" gap="3">
                <Heading
                  size="4"
                  style={{
                    color: "var(--pink-9)",
                  }}
                >
                  PayFi to Reality
                </Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  No more fiat needed. Use your Bitcoin yield to pay
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section
        size="3"
        style={{
          background: "linear-gradient(135deg, var(--gray-1), var(--gray-2))",
          paddingTop: "60px",
          paddingBottom: "80px",
          borderTop: "1px solid rgba(99, 102, 241, 0.3)",
        }}
      >
        <Container mx="auto" size="3">
          <Flex direction="column" align="center" gap="4">
            <Heading
              size="7"
              style={{
                background:
                  "linear-gradient(90deg, var(--indigo-11), var(--purple-11))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              Ready to start?
            </Heading>
            <Text
              size="4"
              style={{
                color: "var(--gray-12)",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Join thousands of users already benefiting from our platform
            </Text>
            <Button
              size="4"
              style={{
                background:
                  "linear-gradient(45deg, var(--indigo-9), var(--purple-9))",
                borderRadius: "20px",
                color: "white",
                marginTop: "24px",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(79, 70, 229, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(79, 70, 229, 0.4)";
              }}
            >
              <Link
                to="/mint"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Deposit Now
              </Link>
            </Button>
          </Flex>
        </Container>
      </Section>

      <Footer />
    </Box>
  );
}

export default Root;
