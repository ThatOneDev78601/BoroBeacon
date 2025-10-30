import React, { useContext, useState } from "react";
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
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig';
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

const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(25, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(25, "Last name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters") 
    .max(25, "Password is too long"),
  confirmpassword: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  acceptterms: z
    .boolean()
    .refine((value) => value === true, "You must accept the terms"),
})
.refine(data => data.password === data.confirmpassword, {
  message: "Passwords don't match",
  path: ["confirmpassword"],
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

const SignUpWithLeftBackground = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignUpSchemaType) => {
    setLoading(true);
    try {
      console.log("Attempting Firebase signup for:", data.email);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email,
        data.password,
      )
      console.log("Firebase signup successful, user UID:", userCredential?.user?.uid);
      try {
        if (!userCredential?.user) return;
        console.log("user credentials are real")
        await updateProfile(userCredential.user, { 
          displayName: `${data.firstName} ${data.lastName}`
        }).then(async () => {
        console.log("Firebase profile updated with display name.", userCredential.user.displayName,'now updating firestore document...')
        try {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        
        await setDoc(userDocRef, {
          displayName: userCredential.user.displayName
        }, { merge: true }); 
        console.log("Firestore user document updated with displayName.");

      } catch (firestoreError) {
         console.error("Error updating Firestore user document displayName:", firestoreError);
      };


        }).catch((error) => {
          console.warn("Error updating Firebase profile:", error);
        });
      } catch (profileError) {
        console.warn("Could not update Firebase profile:", profileError);
        
      }

      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Account created successfully 👋",
      });

      reset();

    } catch (error: any) {
      setLoading(false);
      console.error("Firebase signup error:", error);

      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak (must be at least 6 characters).';
      }
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: errorMessage,
      });
    }
  };

  const handleState = () => setShowPassword((showState) => !showState);
  const handleConfirmPwState = () => setShowConfirmPassword((showState) => !showState);

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
        <Pressable
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start' }} 
        >
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden stroke-background-800"
            size="xl"
          />
        </Pressable>
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Sign up
          </Heading>
          <View style={{ marginTop: 10 }}>
            <Text className="md:text-center">Sign up and start using the app</Text>
          </View>
        </VStack>
      </VStack>

      <VStack className="w-full">
        <VStack space="md" className="w-full">
          <HStack space="md"> 
            <FormControl
              isInvalid={!!errors.firstName}
              style={{ flex: 1 }}
            >
              <FormControlLabel>
                <FormControlLabelText>First Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="firstName"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="First Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor={"#adb5bf"}
                      returnKeyType="next"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.firstName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.lastName} style={{ flex: 1 }}>
              <FormControlLabel>
                <FormControlLabelText>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="lastName"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="Last Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor={"#adb5bf"}
                      returnKeyType="next"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.lastName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </HStack>

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
                    returnKeyType="next"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon}/>
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
          </FormControl>

          <FormControl isInvalid={!!errors.confirmpassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="confirmpassword"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Confirm Password"
                    className="text-sm"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={"#adb5bf"}
                    onSubmitEditing={handleKeyPress} 
                    returnKeyType="done"
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleConfirmPwState} className="pr-3">
                    <InputIcon
                      as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    
                    />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.confirmpassword?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={!!errors.acceptterms} style={{ marginTop: 16 }}>
            <Controller
              name="acceptterms"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Pressable onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox
                        size="sm"
                        value="acceptterms" 
                        isChecked={value}
                        onChange={onChange} 
                        aria-label="Accept terms checkbox"
                        accessibilityLabel="Accept terms and conditions checkbox"
                    >
                        <CheckboxIndicator style={{ marginRight: 8 }}>
                        <CheckboxIcon as={CheckIcon} />
                        </CheckboxIndicator>
                        <CheckboxLabel>
                        I accept the Terms of Use & Privacy Policy
                        </CheckboxLabel>
                    </Checkbox>
                 </Pressable>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.acceptterms?.message}
              </FormControlErrorText>
            </FormControlError>
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
              <ButtonText className="font-medium">Sign up</ButtonText>
            )}
          </Button>
        </VStack>

        <HStack className="self-center" space="xs">
          <Text size="sm">Already have an account?</Text>
          <Link onPress={() =>{
            router.push("/(auth)/login")
          }}>
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
              size="sm"
            >
              Log In
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default function SignUpScreen() {
  return (
    <>
      <AuthLayout showImage={false}> 
        <SignUpWithLeftBackground />
      </AuthLayout>
      <Toast config={toastConfig} />
    </>
  );
};