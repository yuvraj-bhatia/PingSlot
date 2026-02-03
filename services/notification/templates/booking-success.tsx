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
import type { Target, Booking, RequirementItem } from "@/lib/types";

interface BookingSuccessEmailProps {
  target: Target;
  booking: Booking;
  requirements?: RequirementItem[];
}

function formatSlot(datetime?: Date | string | null): string {
  if (!datetime) return "See your confirmation for details";
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return String(datetime);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingSuccessEmail({ target, booking, requirements = [] }: BookingSuccessEmailProps) {
  const slotText = formatSlot(booking.slotDateTime);
  const hasRequirements = requirements.length > 0;

  return (
    <Html>
      <Head />
      <Preview>{`Booking confirmed for ${target.name}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed</Heading>
          <Text style={text}>
            Your appointment for <strong>{target.name}</strong> is confirmed.
          </Text>

          <Section style={card}>
            <Text style={label}>Appointment time</Text>
            <Text style={value}>{slotText}</Text>
            {booking.confirmationNum && (
              <Text style={small}>Confirmation: {booking.confirmationNum}</Text>
            )}
          </Section>

          {hasRequirements && (
            <Section style={card}>
              <Text style={label}>What to bring</Text>
              {requirements.map((item, index) => (
                <Text key={`${item.text}-${index}`} style={listItem}>
                  - {item.text}
                </Text>
              ))}
            </Section>
          )}

          <Button style={button} href={target.bookingUrl}>
            View Booking
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            Need to reschedule? Use the booking link above or contact the appointment office directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f3f4f6",
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
  border: "1px solid #e5e7eb",
  marginBottom: "20px",
};

const label = {
  color: "#6b7280",
  fontSize: "13px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px 0",
};

const value = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: 600,
  margin: "0 0 8px 0",
};

const small = {
  color: "#6b7280",
  fontSize: "14px",
  margin: 0,
};

const listItem = {
  color: "#374151",
  fontSize: "14px",
  margin: "0 0 6px 0",
};

const button = {
  backgroundColor: "#16a34a",
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
