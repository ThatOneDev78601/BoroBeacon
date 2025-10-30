import React, { useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { LinkText } from "@/components/ui/link";
import { View, ActivityIndicator } from "react-native";
import { Link } from "@/components/ui/link";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { useRouter } from "expo-router";
import { AuthLayout } from "./auth-layout"; 
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from "react-native-toast-message";

import { auth } from '@/firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth";

const toastConfig = {
  success: (props: BaseToastProps) => (
    <View style={{ marginTop: 15 }}>
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#0fd30f" }}
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

const LoginWithLeftBackground = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", 
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginSchemaType) => {
    setLoading(true);
    try {
      console.log("Attempting Firebase login for:", data.email);

      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email,
        data.password
      );
      console.log("Firebase login successful, user UID:", userCredential.user.uid);
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged in successfully 👋",
      });
      reset(); 

    } catch (error: any) {
      setLoading(false);
      console.error("Firebase login error:", error);

      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    }
  };

  const handleState = () => setShowPassword((showState) => !showState);

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <VStack
      style={{ marginTop: 30 }}
      className="max-w-[440px] w-full"
      space="md"
    >
      <VStack className="md:items-center" space="md">
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Log In
          </Heading>
          <View style={{ marginTop: 10 }}>
            <Text className="md:text-center">Welcome back!</Text>
          </View>
        </VStack>
      </VStack>

      <VStack className="w-full">
        <VStack space="md" className="w-full">
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Email"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={"#adb5bf"}
                    returnKeyType="next"
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
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={"#adb5bf"}
                    returnKeyType="done" 
                    onSubmitEditing={handleKeyPress}
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
             <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                    {errors?.password?.message}
                </FormControlErrorText>
             </FormControlError>
             <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                <Link onPress={() =>{
                    router.push("/(auth)/forgot-password")
                }}>
                    <LinkText size="sm">Forgot Password?</LinkText>
                </Link>
             </View>
          </FormControl>
        </VStack>

        <VStack className="w-full my-7" space="lg">
          <Button
            className="w-full"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText className="font-medium">Log In</ButtonText>
            )}
          </Button>
        </VStack>

        <HStack className="self-center" space="xs">
          <Text size="sm">Don't have an account?</Text>
          <Link onPress={() =>{
            router.push("/(auth)/signup")
          }}> 
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
              size="sm"
            >
              Sign Up
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default function LoginScreen() {
  return (
    <>
      <AuthLayout showImage={false}>
        <LoginWithLeftBackground />
      </AuthLayout>
      <Toast config={toastConfig} />
    </>
  );
};