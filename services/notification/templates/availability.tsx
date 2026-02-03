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
import type { Target, SlotInfo } from "@/lib/types";

interface AvailabilityEmailProps {
  target: Target;
  slots: SlotInfo[];
}

function formatSlot(datetime?: string): string {
  if (!datetime) return "Slot available";
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return datetime;
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AvailabilityEmail({ target, slots }: AvailabilityEmailProps) {
  const primarySlot = slots[0];
  const additionalSlots = slots.slice(1, 4);

  return (
    <Html>
      <Head />
      <Preview>{`Appointment available for ${target.name}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Appointment Available</Heading>
          <Text style={text}>
            Good news! PingSlot found an appointment slot for <strong>{target.name}</strong>.
          </Text>

          <Section style={card}>
            <Text style={label}>Next available slot</Text>
            <Text style={value}>{formatSlot(primarySlot?.datetime)}</Text>
            {primarySlot?.location && (
              <Text style={small}>Location: {primarySlot.location}</Text>
            )}
          </Section>

          {additionalSlots.length > 0 && (
            <Section style={listSection}>
              <Text style={label}>More available slots</Text>
              {additionalSlots.map((slot, index) => (
                <Text key={`${slot.datetime}-${index}`} style={listItem}>
                  {formatSlot(slot.datetime)}
                  {slot.location ? ` - ${slot.location}` : ""}
                </Text>
              ))}
            </Section>
          )}

          <Button style={button} href={target.bookingUrl}>
            Book Now
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            You are receiving this email because PingSlot is monitoring this appointment for you.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
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

const listSection = {
  backgroundColor: "#ffffff",
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  marginBottom: "20px",
};

const listItem = {
  color: "#374151",
  fontSize: "14px",
  margin: "0 0 6px 0",
};

const button = {
  backgroundColor: "#2563eb",
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
