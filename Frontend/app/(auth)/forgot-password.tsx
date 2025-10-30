import React, { useState, useEffect , useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Keyboard, View, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { useRouter } from "expo-router"; 
import { Pressable } from "@/components/ui/pressable";
import { AuthLayout } from "./auth-layout";
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from "react-native-toast-message";


import { auth } from '@/firebaseConfig'; 
import { sendPasswordResetEmail } from "firebase/auth";
import { HStack } from "@/components/ui/hstack";
import { LinkText } from "@/components/ui/link";

const toastConfig = {
  success: (props: BaseToastProps) => (
    <View style={{ marginTop: 15 }}>
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#0fd30f' }}
        contentContainerStyle={{ backgroundColor: "#1f1f1f" }}
        text1Style={{ color: "#fff" }}
      />
    </View>
  ),
  error: (props: BaseToastProps) => (
    <View style={{ marginTop: 15 }}>
      <ErrorToast
        {...props}
        contentContainerStyle={{ backgroundColor: "#1f1f1f" }}
        text1Style={{ color: "#fff" }}
      />
    </View>
  ),
};

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); 
  const timerRef = useRef<number | null>(null);
  const router = useRouter();

useEffect(() => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null; 
    }

    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    if (cooldown > 0) return; 

    setLoading(true);
    try {
      console.log("Attempting password reset for:", data.email);

      await sendPasswordResetEmail(auth, data.email);
     

      console.log("Password reset email request sent successfully (check emulator logs).");
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Request Sent!',
        text2: __DEV__
               ? 'Check emulator logs for the reset link.'
               : `Password reset instructions sent to ${data.email}.`,
      });
      reset(); 
      setCooldown(30);


    } catch (error: any) {
      setLoading(false);
      console.error("Firebase password reset error:", error);

      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') {
   
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
           errorMessage = 'Too many requests. Please try again later.';
      }
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: errorMessage,
      });
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <VStack style={{ marginTop: 30 }} className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
          <Icon as={ArrowLeftIcon} className="md:hidden stroke-background-800" size="xl" />
        </Pressable>
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Forgot Password?
          </Heading>
          <Text className="md:text-center text-sm mt-2">
            Enter the email associated with your account.
          </Text>
        </VStack>
      </VStack>

      <VStack space="xl" className="w-full mt-5"> 
        <FormControl isInvalid={!!errors?.email} className="w-full">
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            defaultValue=""
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Enter email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  placeholderTextColor={"#adb5bf"}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <Button
           className="w-full mt-4"
           onPress={handleSubmit(onSubmit)}
           disabled={loading || cooldown > 0}
        >
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
            <ButtonText className="font-medium">
              {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send Reset Link'}
            </ButtonText>
          )}
        </Button>
      </VStack>
         <HStack className="self-center mt-5" space="xs">
          <Pressable onPress={() => router.back()}>
            <LinkText size="sm">Back to Log In</LinkText>
          </Pressable>
         </HStack>
    </VStack>
  );
};

export default function ForgotPasswordScreenWrapper() {
  return (
    <>
      <AuthLayout showImage={false}>
        <ForgotPasswordForm />
      </AuthLayout>
      <Toast config={toastConfig} />
    </>
  );
};