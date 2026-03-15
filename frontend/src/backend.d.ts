import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QuizQuestion {
    question: string;
    correctAnswerIndex: bigint;
    options: Array<[string, string]>;
}
export interface Dictionary {
    sourceLanguage: string;
    owner: Principal;
    name: string;
    favoriteWords: Array<string>;
    targetLanguage: string;
    wordPairs: Array<[string, string]>;
    unknownWords: Array<string>;
    quizPosition: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addWordPair(dictionaryName: string, sourceWord: string, translation: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportWordPairs(dictionaryName: string, input: string): Promise<void>;
    createDictionary(name: string, sourceLanguage: string, targetLanguage: string): Promise<void>;
    getAllDictionaries(): Promise<Array<Dictionary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDictionary(name: string): Promise<Dictionary | null>;
    getFavoriteQuizQuestion(dictionaryName: string): Promise<QuizQuestion | null>;
    getQuizQuestion(dictionaryName: string): Promise<QuizQuestion | null>;
    getUnknownQuizQuestion(dictionaryName: string): Promise<QuizQuestion | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markWordAsUnknown(dictionaryName: string, word: string): Promise<void>;
    removeWordFromUnknown(dictionaryName: string, word: string): Promise<void>;
    removeWordPair(dictionaryName: string, sourceWord: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleFavoriteWord(dictionaryName: string, word: string): Promise<boolean>;
    updateWordPair(dictionaryName: string, originalWord: string, newWord: string, newTranslation: string): Promise<void>;
}
