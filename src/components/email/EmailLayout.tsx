import * as React from "react";
import { Body, Container, Head, Html, Tailwind, Hr, Section, Text, Img } from "@react-email/components";

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f9fafb] font-sans m-0 p-0">
          <Container className="mx-auto my-10 px-6 pt-12 pb-24 max-w-[600px] bg-white rounded-lg shadow-sm border border-gray-100">
            {/* GLOBAL HEADER */}
            <Section className="mb-10 text-center">
              {/* Replace with actual hosted logo URL later if available */}
              <Text className="text-[28px] font-bold text-[#2563eb] m-0">Damian iTech</Text>
            </Section>

            {/* CONTENT INJECTION */}
            {children}

            {/* GLOBAL FOOTER */}
            <Hr className="border-[#E5E7EB] my-10" />
            <Section>
              <Text className="text-[13px] leading-[24px] text-[#6B7280] mb-6">
                Need help? Simply reply to this email to speak with our support team. We're always here for you.
              </Text>
              <Text className="text-[11px] leading-[18px] text-[#A1A1AA] uppercase tracking-widest font-medium">
                © {new Date().getFullYear()} Damian iTech.<br />
                Accra, Ghana
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
