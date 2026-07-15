import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useAuth} from "@/hooks/useAuth.ts";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TasksSchema, type TasksSchemaType} from "@/schemas/tasks.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, InfoIcon, Trash2} from "lucide-react";
import {useTask} from "@/hooks/useTask.ts";
import {AnimatePresence, motion} from "framer-motion";
import {useAllTasks} from "@/hooks/useAllTasks.ts";
import {useDeleteTask} from "@/hooks/useDeleteTask.ts";

export function MainPage() {
    const deleteTask = useDeleteTask();
    const { mutate, isSuccess, isError } = useTask();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TasksSchemaType>({
        resolver: zodResolver(TasksSchema)
    });
    const [show, isShow] = useState(false);
    const { data } = useAuth();
    const tasks = useAllTasks();

    const OnSubmitTasks = (data: TasksSchemaType) => {
        mutate({ title: data.title, description: data.description });
        reset();
    };

    return (
        <>
        <div className="flex min-h-screen justify-center items-center flex-col lg:flex-row gap-3 p-4">
            <div className="flex flex-col gap-3 items-center max-w-sm w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-sm w-full">
                    <Card className="max-w-sm w-full">
                        <CardHeader>
                            <CardTitle>{`Hello, ${data?.user.username}!`}</CardTitle>
                            <CardDescription>You can show your profile.</CardDescription>
                            <Button onClick={() => isShow(!show)} className="mt-1">{show ? "Un show" : "Show"}</Button>
                        </CardHeader>
                    </Card>
                </motion.div>
                <AnimatePresence>
                    {show && (
                        <motion.div
                            key={data?.user.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="max-w-sm w-full">
                            <Card className="max-w-sm w-full">
                                <CardHeader>
                                    <CardTitle>Your profile:</CardTitle>
                                    <CardDescription>{`ID: ${data?.user.id}`}</CardDescription>
                                    <CardDescription>{`Username: ${data?.user.username}`}</CardDescription>
                                    <CardDescription>{`CreatedAt: ${data?.user.createdAt}`}</CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-sm w-full">
                    <Card className="max-w-sm w-full">
                        <CardHeader>
                            <form onSubmit={handleSubmit(OnSubmitTasks)} className="flex flex-col gap-2">
                                <div>
                                    <CardTitle>Task Scheduler</CardTitle>
                                    <CardDescription>You can add a task by filling in the fields below.</CardDescription>
                                </div>
                                <div>
                                    <CardDescription>Title</CardDescription>
                                    <Input {...register("title")} placeholder="Enter your title"></Input>
                                    {errors.title && (
                                        <p className="text-red-500 mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div>
                                    <CardDescription>Description</CardDescription>
                                    <Input {...register("description")} placeholder="Enter your description"></Input>
                                    {errors.description && (
                                        <p className="text-red-500 mt-1">{errors.description.message}</p>
                                    )}
                                </div>
                                <Button type="submit" className="mt-1">Add</Button>
                            </form>
                        </CardHeader>
                    </Card>
                </motion.div>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-sm w-full">
                        <Alert className="max-w-sm w-full">
                            <InfoIcon />
                            <AlertTitle>Task created!</AlertTitle>
                            <AlertDescription>
                                Your task has been successfully added to
                                the list.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                {isError && (
                    <Alert variant="destructive" className="max-w-sm w-full">
                        <AlertCircleIcon />
                        <AlertTitle>Failed to create task</AlertTitle>
                        <AlertDescription>
                            Something went wrong while
                            creating your task. Please try again.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="flex flex-col items-center lg:items-start lg:w-96 w-full max-w-sm">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-sm w-full">
                    <Card className="max-w-sm w-full">
                        <CardHeader>
                            <CardTitle>Your tasks</CardTitle>
                            <CardDescription>Here you can see all your created tasks.</CardDescription>
                            {tasks.isLoading && (
                                <CardDescription className="mt-3">Loading tasks...</CardDescription>
                            )}
                            {!tasks.isLoading && tasks.data?.tasks?.length === 0 && (
                                <CardDescription className="mt-3">No tasks yet. Create one above!</CardDescription>
                            )}
                            <AnimatePresence>
                                {tasks.data?.tasks?.map((task) => (
                                    <motion.div
                                        key={task.task_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex flex-row justify-between items-center">
                                                    <div>
                                                        <CardTitle>{task.title}</CardTitle>
                                                        <CardDescription>{task.description}</CardDescription>
                                                    </div>
                                                    <div className="px-1">
                                                        <Button onClick={() => deleteTask.mutate({ task_id: task.task_id })}><Trash2/></Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </CardHeader>
                    </Card>
                </motion.div>
            </div>
        </div>
        </>
    )
}