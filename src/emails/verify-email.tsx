import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  token: string;
}

export default function VerifyEmail({ name, token }: VerifyEmailProps) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Verify your email address for PlanOneMedia</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thanks for signing up for PlanOneMedia. Please verify your email
            address by clicking the button below.
          </Text>
          <Section style={btnSection}>
            <Button href={verifyUrl} style={btn}>
              Verify Email
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={link}>{verifyUrl}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t sign up for PlanOneMedia, you can ignore this
            email.
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

const btnSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const btn = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const link = {
  color: "#2563eb",
  fontSize: "12px",
  wordBreak: "break-all" as const,
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
