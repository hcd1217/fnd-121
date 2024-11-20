import { Container, Divider, Flex, Text } from "@mantine/core";
import { IconCurrencyBitcoin } from "@tabler/icons-react";
import Body from "./components/main";

export default function App() {
  return (
    <Container fluid>
      <Flex
        h="100vh"
        direction="column"
        style={{ overflow: "hidden" }}
      >
        <Header />
        <Body />
        <Divider my="xs" color="gray.3" />
        <Footer />
      </Flex>
    </Container>
  );
}

function Footer() {
  return (
    <Flex w="100vw" align="center" justify="center" gap="sm" p="xs">
      <Text c="dimmed" fz="xs">
        © 2021 Fund management
      </Text>
    </Flex>
  );
}

function Header() {
  const debug = true;
  if (debug) {
    return <></>;
  }
  return (
    <Flex w="100vw" align="center" justify="start" gap="sm" p="xs">
      <IconCurrencyBitcoin
        size={28}
        style={{
          color: "var(--mantine-color-primary-7)",
        }}
      />
      <Text fz="h2" fw="bold" c="primary.7">
        Fund management
      </Text>
    </Flex>
  );
}
