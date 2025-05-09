import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface AppUser {
  id: string;
  username: string;
  fullname: string;
  title: string;
  email: string;
  roles: number[];
}

export interface JWTWithUser {
    user: AppUser;
    exp: number;
    iat: number;
  }

export interface BackendToken {
    accessToken: string;
    refreshToken: string;
    // no more expires_at
  }
  
  export interface AuthorizeUser extends User {
    id: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    user: AppUser;
  }
  
  export interface AppJWT extends JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    user: AppUser;
  }
  
