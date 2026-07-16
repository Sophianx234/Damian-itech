import * as React from "react";
import { Heading, Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface WelcomeMailProps {
  userName?: string;
  storeUrl?: string;
}

export default function WelcomeMail({
  userName = "there",
  storeUrl = "https://damian-itech.com",
}: WelcomeMailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Akwaaba, welcome to Damian iTech! 🎉
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        Your account has been successfully created. We're thrilled to have you on board! You can now start exploring and shopping the latest tech gadgets at affordable prices.
      </Text>

      <Section className="mb-10 text-center">
        <Button
          href={storeUrl}
          className="bg-[#2563eb] text-white px-8 py-3 rounded-lg text-[14px] font-semibold tracking-wide inline-block"
        >
          Start Shopping
        </Button>
      </Section>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        If you have any questions or need help finding the right product, our support team is always ready to assist you.
      </Text>
    </EmailLayout>
  );
}
