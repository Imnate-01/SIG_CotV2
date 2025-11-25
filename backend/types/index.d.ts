// src/types/index.d.ts

declare namespace Express {
  export interface Request {
    // Si en el futuro agregas auth, tokens, etc.
    user?: {
      id: number;
      email: string;
      rol?: string;
    };
  }
}

// Variables de entorno (opcional, pero recomendable)
declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USER?: string;
    DB_PASS?: string;
    DB_NAME?: string;
  }
}
