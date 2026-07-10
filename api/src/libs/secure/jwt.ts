import { config } from "#/config";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(config.JWT_SECRET);

export class TokenService {
    async signAccess(id: string): Promise<string> {
        return new SignJWT({ sub: id })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(secret);
    }

    async signRefresh(id: string): Promise<string> {
        return new SignJWT({ sub: id })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);
    }

    async verify(token: string) {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    }
}

// JWTService

import { SignJWT, jwtVerify } from "jose";
import { config } from "../../config/config";

export interface JWTPayload {
    sub: string;
}

export class JWTService {
    private readonly secret: Uint8Array;
    
    constructor(secret: string = config.JWT_SECRET) {
        this.secret = new TextEncoder().encode(secret);
    }

    async sign(payload: JWTPayload, expiresIn: string = "15m"): Promise<string> {
        return await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(this.secret);
    }

    async verify(token: string): Promise<JWTPayload> {
        const { payload } = await jwtVerify(token, this.secret);
        return payload as JWTPayload;
    }
}