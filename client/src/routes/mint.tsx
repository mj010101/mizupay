import { Footer } from "../components/Footer";
import { LockAndMintPanel } from "../components/LockAndMintPanel";
import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";

function Mint() {
  return (
    <Box
      style={{
        background: "linear-gradient(135deg, var(--indigo-1), var(--purple-1))",
        color: "var(--gray-12)",
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
            "linear-gradient(135deg, var(--indigo-2), var(--purple-2))",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container mx="auto" size="3">
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
                color: "var(--indigo-10)",
              }}
            >
              Lock & Mint Assets
            </Heading>
            <Text
              size="3"
              style={{
                color: "var(--gray-11)",
              }}
            >
              Lock your zBTC as collateral and mint zUSD tokens. Your zBTC will
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
