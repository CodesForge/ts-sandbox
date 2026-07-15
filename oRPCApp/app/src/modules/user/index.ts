import {TaskRepository, UserRepository} from "./repository.ts";
import {db} from "../../libs/db/config.ts";
import {TaskService, UserService} from "./service.ts";
import {JWTService} from "../../libs/secure/jwt.ts";
import {redis} from "../../libs/cache/redis.ts";

// User

export const userRepository = new UserRepository(db);

export const jwt = new JWTService();

export const userService = new UserService(userRepository, jwt, redis);

// Task

export const taskRepository = new TaskRepository(db);

export const taskService = new TaskService(taskRepository);