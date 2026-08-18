export interface PasswordResetData {
    userId: string,
    email: string,
    name: string,
    otpHash: string,
    attempts: number,
}

export interface IPasswordResetStore {
    create(
        verificationId: string,
        data: PasswordResetData,
        ttlSeconds: number,
    ): Promise<void>;

    get(
        verificationId: string,
    ): Promise<PasswordResetData | null>;

    update(
        verificationId: string,
        data: PasswordResetData,
        ttlSeconds?: number,
    ): Promise<void>;

    incrementAttempts(
        verificationId: string,
    ): Promise<number>;

    delete(
        verificationId: string,
    ): Promise<void>;

    exists(
        verificationId: string,
    ): Promise<boolean>;

    acquireVerificationLock(
        verificationId: string,
        lockId: string,
        ttlSeconds: number,
    ): Promise<boolean>;

    releaseVerificationLock(
        verificationId: string,
        lockId: string,
    ): Promise<void>;
}
