import { AppError } from "./app.error";

export class InvalidCredentials extends AppError {
    constructor() {
        super(401, "Invalid email or password");
        this.name = "InvalidCredentials";
    }
}
