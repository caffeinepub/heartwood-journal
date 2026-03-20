import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DiaryEntry {
    id: string;
    content: string;
    date: string;
    mood: string;
    tags: Array<string>;
    moodEmoji: string;
    timestamp: bigint;
    photoBlobIds: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(entry: DiaryEntry): Promise<void>;
    deleteEntry(entryId: string): Promise<void>;
    getAllDatesWithEntries(): Promise<Array<string>>;
    getAllEntries(): Promise<Array<DiaryEntry>>;
    getCallerUserRole(): Promise<UserRole>;
    getEntriesByDate(date: string): Promise<Array<DiaryEntry>>;
    isCallerAdmin(): Promise<boolean>;
    updateEntry(entry: DiaryEntry): Promise<void>;
}
