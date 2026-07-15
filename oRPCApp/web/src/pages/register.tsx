import { Button } from "@/components/ui/button"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {RegisterSchema, type RegisterSchemaType} from "@/schemas/register.tsx";
import {useRegister} from "@/hooks/useRegister.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, InfoIcon} from "lucide-react";

export function RegistrationPage() {
    const { mutate, isPending, isError, isSuccess } = useRegister()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterSchemaType>({
        resolver: zodResolver(RegisterSchema),
    });

    const onSubmit = (data: RegisterSchemaType) => {
        mutate({ username: data.username, password: data.password });
        reset();
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen flex-col gap-5">
                <Card className="max-w-sm w-full">
                    <CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                            <div>
                                <CardTitle>Create an Account</CardTitle>
                                <CardDescription>Enter your details to get started. It only takes a minute.</CardDescription>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <CardDescription>Username</CardDescription>
                                    <Input {...register("username")} placeholder="Enter your username"></Input>
                                    {errors.username && (
                                        <p className="text-red-500">{errors.username.message}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <CardDescription>Password</CardDescription>
                                    <Input {...register("password")} placeholder="Enter your password" type="password"></Input>
                                    {errors.password && (
                                        <p className="text-red-500">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <Button className="w-full" type="submit">{isPending ? "Sending..." : "Create Account"}</Button>
                            </div>
                        </form>
                    </CardHeader>
                </Card>
                {isSuccess && (
                    <Alert className="max-w-sm w-full">
                        <InfoIcon />
                        <AlertTitle>Account created!</AlertTitle>
                        <AlertDescription>
                            Check your email to confirm your account.
                        </AlertDescription>
                    </Alert>
                )}
                {isError && (
                    <Alert variant="destructive" className="max-w-sm w-full">
                        <AlertCircleIcon />
                        <AlertTitle>Registration failed</AlertTitle>
                        <AlertDescription>
                            An account with this email already exists. Try another one.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    )
}
