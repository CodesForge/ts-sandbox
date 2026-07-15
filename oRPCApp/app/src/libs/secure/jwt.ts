import {SignJWT, jwtVerify, type JWTPayload} from "jose";
import {config} from "../config/config.ts";

export interface jwtPayload extends JWTPayload{
    sub: string;
}

export class JWTService {
    private readonly secretKey: string;

    constructor(private secret?: string) {
        this.secretKey = secret ?? config.JWT_SECRET;
    };

    async signAccessToken(payload: jwtPayload): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(new TextEncoder().encode(this.secretKey));
    }

    async verifyAccessToken(token: string): Promise<jwtPayload> {
        const { payload } = await jwtVerify(
            token, new TextEncoder().encode(this.secretKey)
        );
        return payload as jwtPayload;
    }
}