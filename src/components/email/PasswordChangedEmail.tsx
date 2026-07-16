import * as React from "react";
import { Heading, Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface PasswordChangedEmailProps {
  userName?: string;
  loginUrl?: string;
}

export default function PasswordChangedEmail({
  userName = "there",
  loginUrl = "https://damian-itech.com/login",
}: PasswordChangedEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Password successfully changed
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        This is a confirmation that the password for your Damian iTech account has been successfully changed.
      </Text>

      <Section className="mb-10 text-center">
        <Button
          href={loginUrl}
          className="bg-[#2563eb] text-white px-8 py-3 rounded-lg text-[14px] font-semibold tracking-wide inline-block"
        >
          Sign in to your account
        </Button>
      </Section>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        If you did not make this change, please contact our support team immediately to secure your account.
      </Text>
    </EmailLayout>
  );
}
