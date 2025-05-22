import { ConvertPanel } from "../components/ConvertPanel";
import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Footer } from "../components/Footer";

function Earn() {
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
                color: "#4DA2FF",
              }}
            >
              Stake Your Assets
            </Heading>
            <Text
              size="3"
              style={{
                color: "#CEE3E4",
              }}
            >
              Stake your mzUSD to receive smzUSD tokens and earn yield over
              time. Your funds are distributed across multiple high-performing
              vaults.
            </Text>
          </Flex>
          <Flex justify="center" width="100%">
            <Box style={{ width: "100%", maxWidth: "500px" }}>
              <ConvertPanel mode="mzUSD" />
            </Box>
          </Flex>
        </Container>
      </Section>
      <Footer />
    </Box>
  );
}

export default Earn;
