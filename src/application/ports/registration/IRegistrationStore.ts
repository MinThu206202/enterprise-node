export interface RegistrationData {
  email: string;
  name: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
}

export interface IRegistrationStore {
  create(
    verificationId: string,
    data: RegistrationData,
    ttlSeconds: number,
  ): Promise<void>;

  get(verificationId: string): Promise<RegistrationData | null>;

  update(
    verificationId: string,
    data: RegistrationData,
    ttlSecond: number,
  ): Promise<void>;

  incrementAttempts(verificationId: string): Promise<number>;

  delete(verificationId: string): Promise<void>;

  exists(verificationId: string): Promise<boolean>;

  acquireVerificationLock(
    verificationId : string , 
    lookId : string ,
    ttlSecond : number,
  ): Promise<boolean> ;

  releaseVerificationLock(
    verificationId : string ,
    lockId : string
  ): Promise<void>;
}
