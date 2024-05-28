declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
  }
}
