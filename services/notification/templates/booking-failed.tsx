import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";
import type { Target } from "@/lib/types";

interface BookingFailedEmailProps {
  target: Target;
  error: string;
}

export function BookingFailedEmail({ target, error }: BookingFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Booking failed for ${target.name}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Failed</Heading>
          <Text style={text}>
            PingSlot attempted to book <strong>{target.name}</strong>, but it did not complete.
          </Text>

          <Section style={card}>
            <Text style={label}>Error details</Text>
            <Text style={value}>{error}</Text>
          </Section>

          <Button style={button} href={target.bookingUrl}>
            Try Booking Manually
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            We will keep monitoring and notify you if new slots appear.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const h1 = {
  color: "#111827",
  fontSize: "26px",
  fontWeight: 700,
  marginBottom: "12px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
};

const card = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #fee2e2",
  marginBottom: "20px",
};

const label = {
  color: "#b91c1c",
  fontSize: "13px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px 0",
};

const value = {
  color: "#111827",
  fontSize: "14px",
  margin: 0,
};

const button = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: 600,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
};
