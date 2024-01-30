import { User } from "~/stores/users";

declare module '#auth-utils' {
    interface UserSession {
        user: User,
        loggedInAt: Date
    }
}
export {}