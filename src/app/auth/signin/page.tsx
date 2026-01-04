"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})

export default function SignInPage() {
    const [error, setError] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("")
        startTransition(async () => {
            try {
                // We use the NextAuth signIn function (client-side)
                // Adjust redirect: false to handle errors manually if desired, 
                // or let it redirect automatically.
                const res = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                })

                if (res?.error) {
                    setError("Invalid credentials")
                } else {
                    router.push("/")
                    router.refresh()
                }
            } catch (err) {
                setError("Something went wrong")
            }
        })
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <Card className="w-[400px] shadow-lg border-t-4 border-t-indigo-500">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="diego@example.com"
                                                    type="email"
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
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="******"
                                                    type="password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                Sign In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/auth/signup" className="text-sm text-slate-500 hover:text-indigo-600 hover:underline">
                        Don't have an account? Sign up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
