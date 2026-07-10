"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ---- SIGNUP FLOW ----

export async function signupStep1(formData: {
  fullName: string;
  phone: string;
}) {
  try {
    await dbConnect();
    const { fullName, phone } = formData;

    if (!fullName || !phone) {
      return {
        success: false,
        error: "Full name and phone number are required.",
      };
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user && user.isVerified) {
      return {
        success: false,
        error:
          "An account with this phone number already exists and is verified.",
      };
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    if (user) {
      // Update unverified user
      user.fullName = fullName;
      user.signupOTP = hashedOtp;
      user.signupOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        fullName,
        phone,
        isVerified: false,
        signupOTP: hashedOtp,
        signupOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    // Send OTP via WhatsApp microservice
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Your Damian iTech signup verification code is ${otpCode}. It is valid for 5 minutes. Do not share this code with anyone.`;

    try {
      const response = await fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, message }),
      });

      if (!response.ok) {
        throw new Error("Microservice returned an error");
      }
    } catch (error) {
      console.error("WhatsApp Microservice Error:", error);
      return {
        success: false,
        error:
          "Failed to send WhatsApp verification message. Please ensure the microservice is running.",
      };
    }

    return { success: true, message: "Verification code sent via WhatsApp." };
  } catch (error: any) {
    console.error("Signup Step 1 Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function signupStep2(formData: { phone: string; otp: string }) {
  try {
    await dbConnect();
    const { phone, otp } = formData;

    if (!phone || !otp) {
      return { success: false, error: "Phone and OTP are required." };
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.signupOTP || !user.signupOTPExpires) {
      return { success: false, error: "No verification code requested." };
    }

    if (user.signupOTPExpires < new Date()) {
      return {
        success: false,
        error:
          "Verification code has expired. Please go back and request a new one.",
      };
    }

    const isMatch = await bcrypt.compare(otp, user.signupOTP);
    if (!isMatch) {
      return { success: false, error: "Invalid verification code." };
    }

    // Mark user as verified
    user.isVerified = true;
    user.signupOTP = undefined;
    user.signupOTPExpires = undefined;
    await user.save();

    return { success: true, message: "Phone number verified successfully." };
  } catch (error: any) {
    console.error("Signup Step 2 Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function signupStep3(formData: {
  phone: string;
  password: string;
}) {
  try {
    await dbConnect();
    const { phone, password } = formData;

    if (!phone || !password) {
      return { success: false, error: "Phone and password are required." };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long.",
      };
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.isVerified) {
      return { success: false, error: "User phone number is not verified." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    // Send friendly welcome message via WhatsApp microservice
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const welcomeMessage = `Akwaaba ${user.fullName.split(" ")[0]}, welcome to Damian iTech! 🎉\n\nYour account has been successfully created. We're thrilled to have you on board. You can now start exploring and shopping  the best latest gadgets at affordable prices !`;

    try {
      // Fire and forget to not block the response
      fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          message: welcomeMessage,
        }),
      }).catch((err) => console.error("Failed to send welcome message:", err));
    } catch (e) {
      console.error("Welcome message dispatch error:", e);
    }

    return {
      success: true,
      message: "Account created and password set successfully.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    };
  } catch (error: any) {
    console.error("Signup Step 3 Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

// ---- FORGOT PASSWORD FLOW ----

export async function forgotPasswordStep1(formData: { phone: string }) {
  try {
    await dbConnect();
    const { phone } = formData;

    if (!phone) {
      return { success: false, error: "Phone number is required." };
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return {
        success: false,
        error: "No account associated with this phone number.",
      };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Your Damian iTech password reset code is ${otpCode}. It is valid for 5 minutes. Do not share this code with anyone.`;

    try {
      const response = await fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, message }),
      });

      if (!response.ok) {
        throw new Error("Microservice returned an error");
      }
    } catch (error) {
      console.error("WhatsApp Microservice Error:", error);
      return {
        success: false,
        error:
          "Failed to send WhatsApp message. Please ensure the notification service is running.",
      };
    }

    return { success: true, message: "OTP sent successfully via WhatsApp." };
  } catch (error: any) {
    console.error("Forgot Password Step 1 Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function forgotPasswordStep2(formData: {
  phone: string;
  otp: string;
}) {
  try {
    await dbConnect();
    const { phone, otp } = formData;

    if (!phone || !otp) {
      return { success: false, error: "Phone and OTP are required." };
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return {
        success: false,
        error: "No verification code requested or it has expired.",
      };
    }

    if (user.resetPasswordExpires < new Date()) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
      return { success: false, error: "Invalid verification code." };
    }

    // We do NOT clear the OTP here because we need it for Step 3 (resetPasswordAction).
    // Alternatively, we could clear it here and set a short-lived token, but reusing the OTP works fine.

    return {
      success: true,
      message:
        "Phone number verified successfully. You can now reset your password.",
    };
  } catch (error: any) {
    console.error("Forgot Password Step 2 Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function resetPasswordAction(formData: {
  phone: string;
  otp: string;
  password: string;
}) {
  try {
    await dbConnect();
    const { phone, otp, password } = formData;

    if (!phone || !otp || !password) {
      return {
        success: false,
        error: "Phone, OTP, and new password are required.",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters.",
      };
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return {
        success: false,
        error: "No verification code requested or it has expired.",
      };
    }

    if (user.resetPasswordExpires < new Date()) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
      return { success: false, error: "Invalid verification code." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successfully.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    };
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return { success: false, error: "Internal server error." };
  }
}
