declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;

    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    GUARDIAN_PRIVATE_KEY: string;
    NEXT_PUBLIC_GUARDIAN_ADDRESS: string;

    NEXT_PUBLIC_WALLET_FACTORY_ADDRESS: `0x${string}`;
  }
}
