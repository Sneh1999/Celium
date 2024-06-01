declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;

    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;

    GUARDIAN_PRIVATE_KEY: string;
    NEXT_PUBLIC_GUARDIAN_ADDRESS: `0x${string}`;
  }
}
