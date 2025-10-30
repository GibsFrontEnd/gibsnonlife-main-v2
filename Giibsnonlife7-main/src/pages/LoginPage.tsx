// @ts-nocheck
import { z } from "zod";
import { Button } from "../components/UI/new-button";
import { Card, CardContent } from "../components/UI/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/UI/form";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Password } from "../components/UI/new-input";
import { useToast } from "../components/UI/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { SERVER_URL } from "../utils/constants";
import axios from "axios";
import { store } from "../features/store";
import { setTokenExpired } from "../features/reducers/authReducers/authSlice";
import { encryptData } from "../utils/encrypt-utils";
import dashImage from "../assets/dash_image.png";

const loginSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const redirectTo = localStorage.getItem("redirectAfterLogin") || "/dashboard";
  const { toast } = useToast();
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  }, []);
    

  useEffect(() => {
    const token = localStorage.getItem("token");
    /*     if (token) {
      navigate("/dashboard", { replace: true });
    }
 */
  }, [navigate]);


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    try {
      console.log("Login data:", data);
      const response = await axios.post(
        `${SERVER_URL}/auth/login?username=${encodeURIComponent(
          data.username
        )}&password=${encodeURIComponent(data.password)}`
      );

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("user", encryptData(data.user));
        localStorage.setItem("token", encryptData(data.token));

        localStorage.setItem("unEncryptedUser", JSON.stringify(data.user));

        toast({
          title: "Login successful!",
          description: "You have been successfully logged in.",
          variant: "success",
          duration: 3000,
        });

        store.dispatch(setTokenExpired(false));
        localStorage.removeItem("redirectAfterLogin");
        window.history.replaceState(null, "", window.location.href);
        navigate(redirectTo, { replace: true });

        window.history.pushState(null, "", redirectTo);
        window.addEventListener("popstate", handleBackButton);
      }
    } catch (error) {
      const status =
        (axios.isAxiosError(error) && error.response?.status) || null;

      if (status === 401) {
        console.log("Invalid email or password. Please try again.");
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Login failed",
          description: "An error occurred during login. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleBackButton = (event) => {
    event.preventDefault();

    setTimeout(() => {
      window.location.href = "";
    }, 100);
  };

  return (
    // <main className="container mx-auto py-6 md:py-10 px-4 flex flex-col items-center justify-center min-h-[80vh]">
    //   <div className="max-w-md w-full">
    //     <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
    //       Welcome Back
    //     </h1>
    //     <p className="text-muted-foreground text-center mb-6">
    //       Sign in to your account to continue
    //     </p>
    //     <Card>
    //       <CardContent className="p-6">
    //         <Form {...form}>
    //           <form
    //             onSubmit={form.handleSubmit(onSubmit)}
    //             className="space-y-6"
    //           >
    //             <FormField
    //               control={form.control}
    //               name="username"
    //               render={({ field }) => (
    //                 <FormItem>
    //                   <FormLabel>Username</FormLabel>
    //                   <FormControl>
    //                     <Input
    //                       placeholder="your.username"
    //                       type="text"
    //                       autoComplete="username"
    //                       {...field}
    //                     />
    //                   </FormControl>
    //                   <FormMessage />
    //                 </FormItem>
    //               )}
    //             />

    //             <FormField
    //               control={form.control}
    //               name="password"
    //               render={({ field }) => (
    //                 <FormItem>
    //                   <FormLabel>Password</FormLabel>
    //                   <Password
    //                     value={field.value}
    //                     onChange={field.onChange}
    //                     placeholder="Enter your password"
    //                     // @ts-ignore
    //                     autoComplete="current-password"
    //                   />
    //                   <FormMessage />
    //                 </FormItem>
    //               )}
    //             />

    //             <div className="flex items-center justify-between">
    //               {/* <FormField
    //                     control={form.control}
    //                     name="rememberMe"
    //                     render={({ field }) => (
    //                       <FormItem className="flex flex-row items-center space-x-2 space-y-0">
    //                         <FormControl>
    //                           <Checkbox
    //                             checked={field.value}
    //                             onCheckedChange={field.onChange}
    //                           />
    //                         </FormControl>
    //                         <FormLabel className="text-sm font-normal cursor-pointer">
    //                           Remember me
    //                         </FormLabel>
    //                       </FormItem>
    //                     )}
    //                   /> */}

    //               {/* <Button
    //                 variant="link"
    //                 className="p-0 h-auto text-sm"
    //                 asLink
    //                 to="/"
    //               >
    //                 Forgot password?
    //               </Button> */}
    //             </div>

    //             <Button
    //               // @ts-ignore
    //               type="submit"
    //               className="w-full bg-primary-blue text-white"
    //               loading={isLoading}
    //               disabled={isLoading}
    //             >
    //               Sign in
    //             </Button>
    //           </form>
    //         </Form>
    //       </CardContent>
    //     </Card>

    //     {/* <div className="mt-6 text-center">
    //           <p className="text-sm text-muted-foreground">
    //             Don&apos;t have an account?{" "}
    //             <Button variant="link" to="/register" asLink className="p-0">
    //               Register here
    //             </Button>
    //           </p>
    //         </div> */}
    //   </div>
    // </main>
    <div className="w-full flex flex-col md:flex-row justify-center items-center min-h-screen gap-12 px-10 md:px-20 py-5 bg-gradient-to-b from-primary-vividBlueBg to-background overflow-auto">
      <div className="md:flex-1 flex flex-col justify-center items-center">
        <h1 className="font-sans text-left text-3xl lg:text-5xl text-neutral-darkCharcoal leading-tight lg:leading-[1.2] mb-4 max-w-5xl mx-auto">
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-[#dc2626] to-[#9254DE] bg-clip-text text-transparent">
            GIBS Enterprise
          </span>
        </h1>
        <p className="mt-2 text-left text-neutral-darkCharcoal">
          Log in to your account to manage policies, streamline HR, and handle
          insurance operations seamlessly
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full mt-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.username"
                      type="text"
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Password
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter your password"
                    // @ts-ignore
                    autoComplete="current-password"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              // @ts-ignore
              type="submit"
              className="w-full bg-primary-blue text-white"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>
        </Form>
      </div>
      <div className="md:flex-1">
        <div className="bg-neutral-softWhite shadow-navShadow hidden md:block p-6 rounded-lg border border-neutral-lightGray">
          <span className="text-xs font-semibold text-destructive bg-red-100 px-3 py-1 rounded-full">
            WHAT’S NEW
          </span>
          <div className="border relative overflow-hidden rounded-md mt-6">
            <img
              src={dashImage}
              className="rounded-lg relative z-10 w-full h-auto"
              alt={"alt"}
            />
          </div>
          <p className="mt-4 text-neutral-darkCharcoal">
            GIBS Enterprise is now live! Experience seamless operations with
            enterprise-grade HR, intelligent insurance management, and smart
            proposals
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-primary-vividBlue font-semibold hover:underline"
          >
            Check Us Out →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
