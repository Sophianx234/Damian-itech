import * as React from "react";
import { Heading, Text, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface PasswordResetEmailProps {
  userName?: string;
  otpCode: string;
}

export default function PasswordResetEmail({
  userName = "there",
  otpCode = "123456",
}: PasswordResetEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Reset your password
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        We received a request to reset the password associated with your Damian iTech account. You can securely set a new password by entering the code below:
      </Text>

      <Section className="mb-10 text-center bg-[#f3f4f6] py-6 rounded-lg">
        <Text className="text-[32px] font-bold tracking-[0.25em] text-[#2563eb] m-0">
          {otpCode}
        </Text>
      </Section>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        For your security, this code will expire in 5 minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
      </Text>
    </EmailLayout>
  );
}
