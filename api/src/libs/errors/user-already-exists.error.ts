import { AppError } from "./app.error";

export class UserAlreadyExists extends AppError {
    constructor(message = "User already exists") {
        super(409, message);
    }
}