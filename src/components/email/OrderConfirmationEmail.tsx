import * as React from "react";
import { Heading, Text, Section, Hr, Row, Column } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  userName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  paymentMethod: string;
}

export default function OrderConfirmationEmail({
  userName = "Customer",
  orderId = "123456789",
  items = [],
  total = 0,
  deliveryFee = 0,
  paymentMethod = "paystack",
}: OrderConfirmationEmailProps) {
  const firstName = userName.split(" ")[0];
  const finalTotal = total + deliveryFee;

  return (
    <EmailLayout>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Order Confirmed!
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        Thank you for shopping with Damian iTech. We've received your order and we're getting it ready for you!
      </Text>

      <Section className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        <Section className="bg-[#f9fafb] p-4 border-b border-gray-200">
          <Text className="text-[13px] font-bold text-[#111827] uppercase m-0 tracking-wider">
            Order Summary
          </Text>
          <Text className="text-[14px] text-[#6B7280] m-0 mt-1">
            Order ID: {orderId}
          </Text>
        </Section>
        
        <Section className="p-4">
          {items.map((item, i) => (
            <Row key={i} className="mb-4">
              <Column className="w-[70%]">
                <Text className="text-[14px] text-[#111827] m-0 font-medium">
                  {item.quantity}x {item.name}
                </Text>
              </Column>
              <Column className="w-[30%] text-right align-top">
                <Text className="text-[14px] text-[#4B5563] m-0">
                  ₵{(item.price * item.quantity).toLocaleString()}
                </Text>
              </Column>
            </Row>
          ))}
          
          <Hr className="border-[#E5E7EB] my-4" />
          
          <Row className="mb-2">
            <Column className="w-[70%]">
              <Text className="text-[14px] text-[#6B7280] m-0">Subtotal</Text>
            </Column>
            <Column className="w-[30%] text-right">
              <Text className="text-[14px] text-[#111827] m-0">₵{total.toLocaleString()}</Text>
            </Column>
          </Row>
          
          <Row className="mb-4">
            <Column className="w-[70%]">
              <Text className="text-[14px] text-[#6B7280] m-0">Delivery Fee</Text>
            </Column>
            <Column className="w-[30%] text-right">
              <Text className="text-[14px] text-[#111827] m-0">
                {deliveryFee === 0 ? "Free" : `₵${deliveryFee.toLocaleString()}`}
              </Text>
            </Column>
          </Row>

          <Row className="bg-[#f3f4f6] p-3 rounded-md">
            <Column className="w-[70%]">
              <Text className="text-[16px] font-bold text-[#111827] m-0">Total</Text>
            </Column>
            <Column className="w-[30%] text-right">
              <Text className="text-[16px] font-bold text-[#2563eb] m-0">₵{finalTotal.toLocaleString()}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        {paymentMethod === "pickup" 
          ? "Please have your payment ready when you arrive for pickup. We will notify you when your items are ready." 
          : paymentMethod === "paystack"
          ? "Your payment was successfully processed. We'll send you an update once your order has been dispatched."
          : "Your order will be delivered soon. Please prepare cash or mobile money for payment on delivery."}
      </Text>
    </EmailLayout>
  );
}
