import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ClaimNotificationProps {
  companyName: string;
  userName: string;
  userEmail: string;
  claimUrl: string;
}

export default function ClaimNotification({
  companyName,
  userName,
  userEmail,
  claimUrl,
}: ClaimNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New claim request on PlanOneMedia</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Claim Request</Heading>
          <Text style={text}>Hi Admin,</Text>
          <Text style={text}>
            A new supplier claim has been submitted and requires your review.
          </Text>
          <Section style={details}>
            <Text style={label}>Company</Text>
            <Text style={value}>{companyName}</Text>
            <Text style={label}>Claimant</Text>
            <Text style={value}>{userName}</Text>
            <Text style={label}>Email</Text>
            <Text style={value}>{userEmail}</Text>
          </Section>
          <Section style={btnSection}>
            <a href={claimUrl} style={btn}>
              Review Claim
            </a>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from PlanOneMedia.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "system-ui, sans-serif",
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "40px 32px",
};

const h1 = {
  color: "#111",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 24px",
  padding: 0,
};

const text = {
  color: "#444",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const details = {
  backgroundColor: "#f9f9f9",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const label = {
  color: "#888",
  fontSize: "12px",
  fontWeight: "600",
  margin: "8px 0 2px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#111",
  fontSize: "14px",
  margin: "0 0 8px",
};

const btnSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const btn = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footer = {
  color: "#888",
  fontSize: "12px",
  margin: 0,
};
