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