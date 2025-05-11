import { ConvertPanel } from "../components/ConvertPanel";
import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Footer } from "../components/Footer";

function Earn() {
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
            Earn
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
              Stake Your Assets
            </Heading>
            <Text
              size="3"
              style={{
                color: "var(--gray-11)",
              }}
            >
              Stake your zUSD to receive szUSD tokens and earn yield over time.
              Your funds are distributed across multiple high-performing vaults.
            </Text>
          </Flex>
          <Flex justify="center" width="100%">
            <ConvertPanel mode="zusd" />
          </Flex>
        </Container>
      </Section>
      <Footer />
    </Box>
  );
}

export default Earn;
