"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import Formfeild from "./Formfeild";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authformSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().min(3).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const Authforms = ({ type }: { type: FormType }) => {
  const FormScehma = authformSchema(type);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormScehma>>({
    resolver: zodResolver(FormScehma),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof FormScehma>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
         //////console.log(userCredentials);

        const result = await signUp({
          uid : userCredentials.user.uid,
          email:email, 
          password:password,
          name:name!
        });
        //////console.log(result);
        if (!result?.success){
          toast.error(result?.message)
          return;
        }

        toast.success("Sign up successfull");
        //////console.log("sing-up", values);
        router.push("/sign-in");
      } else {
        const {email , password}= values;

       const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken =await userCredentials.user.getIdToken();
          
         if (!idToken) {
          toast.error("Sing in Failed!!")
          return
         }else{
          await signIn({
            email , 
            idToken
          })
          toast.success("Sign in ");
          //////console.log("sing-in", values);
          router.push("/");
         }


      }
    } catch (error) {
      //////console.log(error);
      toast.error(`Something went wrong : ${error}`);
    }
  }

  const isSignIn = type === "sign-in";
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row justify-center ">
          <Image src={"/logo.svg"} alt="logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3 className="text-primary-100">Practice Job Interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <Formfeild
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter your name"
              />
            )}
            <Formfeild
              type="email"
              control={form.control}
              name="email"
              label="Eamil"
              placeholder="Enter your Eamil"
            />

            <Formfeild
              type="password"
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your Password"
            />

            <Button type="submit" className="btn">
              {isSignIn ? "sign in" : "Create an account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account yet?" : "have an account Already"}
          <Link
            className="font-bold text-user-primary  ml-1"
            href={isSignIn ? "/sign-up" : "/sign-in"}
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Authforms;
