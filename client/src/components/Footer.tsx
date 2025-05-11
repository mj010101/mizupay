import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import {
  GitHubLogoIcon,
  DiscordLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";

export function Footer() {
  return (
    <Box
      style={{
        background: "var(--gray-2)",
        borderTop: "1px solid var(--gray-3)",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <Container size="3">
        <Flex justify="between" align="center" wrap="wrap" gap="4">
          <Text style={{ color: "var(--gray-11)" }}>
            © 2025 z-fubao. All rights reserved.
          </Text>
          <Flex gap="4">
            <Link
              to="https://github.com/kws1207/z-fubao"
              style={{
                color: "var(--indigo-11)",
                textDecoration: "none",
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--indigo-3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <GitHubLogoIcon width="24" height="24" />
            </Link>
            <Link
              to="/"
              style={{
                color: "var(--purple-11)",
                textDecoration: "none",
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--purple-3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <DiscordLogoIcon width="24" height="24" />
            </Link>
            <Link
              to="/"
              style={{
                color: "var(--blue-11)",
                textDecoration: "none",
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--blue-3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <TwitterLogoIcon width="24" height="24" />
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
