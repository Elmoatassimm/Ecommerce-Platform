import bcrypt from "bcryptjs";
import IUserService from "./Interfaces/IUserService";
import IUserRepository from "../repositories/interfaces/IUserRepository";
import IRefreshTokenRepository from "../repositories/interfaces/IRefreshTokenInterface";
import { inject, injectable } from "tsyringe";
import JwtUtils from "../utils/jwt.utils";
import {
  ConflictError,
  NotFoundError,
  InternalServerError,
  UnauthorizedError,
} from "../types/errors";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IRefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
    @inject("jwt") private jwt: JwtUtils,
  ) {}

  async register(email: string, password: string, username: string) {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) throw new ConflictError("User already exists");

      const password_hash = await bcrypt.hash(password, 10);

      const user = await this.userRepository.createUser({
        email,
        password_hash,
        username,
      });

      const accessToken = this.jwt.generateAccessToken(
        user.id,
        user.email,
        null,
        user.username,
      );
      const refreshToken = this.jwt.generateRefreshToken(user.id, user.email);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      await this.refreshTokenRepository.create(
        user.id,
        refreshToken,
        expiresAt,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ConflictError) throw error;
      throw new InternalServerError("Failed to register user");
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) throw new NotFoundError("User");

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordValid) throw new UnauthorizedError("Invalid Credentials");

      const storeId = user.store?.id || null;
      const accessToken = this.jwt.generateAccessToken(
        user.id,
        user.email,
        storeId,
        user.username,
      );
      const refreshToken = this.jwt.generateRefreshToken(user.id, user.email);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      await this.refreshTokenRepository.create(
        user.id,
        refreshToken,
        expiresAt,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        throw error;
      }
      throw new InternalServerError("Failed to login"+ error);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const userId = this.jwt.getUserFromRefreshToken(refreshToken);

      const storedRefreshToken =
        await this.refreshTokenRepository.findByUserId(userId);

      if (
        !storedRefreshToken ||
        storedRefreshToken.token !== refreshToken ||
        storedRefreshToken.expires_at < new Date()
      ) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const user = await this.userRepository.findById(userId);
      if (!user) throw new NotFoundError("User");

      const storeId = user.store?.id || null;
      const newAccessToken = this.jwt.generateAccessToken(
        user.id,
        user.email,
        storeId,
        user.username,
      );
      const newRefreshToken = this.jwt.generateRefreshToken(
        user.id,
        user.email,
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      await this.refreshTokenRepository.updateByUserId(
        user.id,
        newRefreshToken,
        expiresAt,
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new InternalServerError("Failed to refresh tokens");
    }
  }

  async logout(token: string) {
    try {
      const userId = this.jwt.getUserIdFromToken(token);

      await this.refreshTokenRepository.deleteByUserId(userId);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new InternalServerError("Failed to logout");
    }
  }
  async getUser(token: string){
    try{
      const user = this.jwt.getUserFromToken(token);
      return { userId: user.userId, email: user.email, username: user.username, storeId: user.storeId }
    } catch(error){
      throw new InternalServerError("Failed to get user");
    }
  }
  
  async validateToken(token: string){
    try{
      const isValid = this.jwt.verifyAccessToken(token);
      return isValid;
    } catch(error){
      throw new InternalServerError("Failed to validate token");
    }
  }
}
