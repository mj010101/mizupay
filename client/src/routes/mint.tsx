import { Footer } from "../components/Footer";
import { LockAndMintPanel } from "../components/LockAndMintPanel";
import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";

function Mint() {
  return (
    <Box
      style={{
        background:
          "linear-gradient(135deg, rgba(1, 24, 41, 0.8), rgba(22, 46, 47, 0.8))",
        color: "#F1F7F7",
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Section
        size="3"
        style={{
          background:
            "linear-gradient(135deg, rgba(22, 46, 47, 0.9), rgba(1, 24, 41, 0.9))",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container mx="auto" size="3">
          <Heading
            as="h1"
            size="8"
            style={{
              background: "linear-gradient(90deg, #4DA2FF, #63C9B9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Mint
          </Heading>
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
          <Flex direction="column" gap="4" mb="6">
            <Heading
              size="5"
              style={{
                color: "#4DA2FF",
              }}
            >
              Lock & Mint Assets
            </Heading>
            <Text
              size="3"
              style={{
                color: "#CEE3E4",
              }}
            >
              Lock your LBTC as collateral and mint LUSD tokens. Your LBTC will
              be locked with a 70% LTV ratio to ensure stability of the
              protocol.
            </Text>
          </Flex>
          <Flex justify="center" width="100%">
            <LockAndMintPanel />
          </Flex>
        </Container>
      </Section>
      <Footer />
    </Box>
  );
}

export default Mint;
