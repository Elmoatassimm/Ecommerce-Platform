import { Request, Response, NextFunction } from "express";
import IUserService from "../services/Interfaces/IUserService";
import { injectable, inject, autoInjectable } from "tsyringe";
import ResponseUtils from "../utils/response.utils";
import "reflect-metadata";
import { RequestWithUser } from "../types/types";
import JwtUtils from "../utils/jwt.utils";

@injectable()
export default class UserController {
  constructor(
    @inject("IUserService") private userService: IUserService,
    @inject("responseUtils") private responseUtils: ResponseUtils,
  ) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const tokens = await this.userService.login(email, password);
      /*res.cookie("x-refresh-token", tokens?.refreshToken, 
                { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
                  httpOnly: true, secure: false, sameSite: "strict" });*/

      this.responseUtils.sendSuccessResponse(res, tokens);
    } catch (error: any) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username } = req.body;

      const tokens = await this.userService.register(email, password, username);
      //res.cookie("x-refresh-token", tokens?.refreshToken, { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), httpOnly: true, secure: false, sameSite: "strict" });
      this.responseUtils.sendSuccessResponse(res, tokens, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
    
      const refreshToken = req.header('Authorization')?.replace('Bearer ','') 

      if (!refreshToken) throw new Error("Invalid refresh token");

      const token = await this.userService.refreshTokens(refreshToken);

      this.responseUtils.sendSuccessResponse(res, token);
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) throw new Error("Invalid refresh token ");

      await this.userService.logout(token);

      this.responseUtils.sendSuccessResponse(res, "Logged out successfully");
    } catch (error: any) {
      next(error);
    }
  }
  async retrieve(req: RequestWithUser, res: Response, next: NextFunction){

    try{
      const token = req.header("Authorization") ? req.header("Authorization")?.replace("Bearer ", "") : req.cookies["x-access-token"];
      console.log("token: ", token)
      const data = await this.userService.getUser(token);
      console.log(data);
      
      this.responseUtils.sendSuccessResponse(res, data);

    } catch(error: any){
      next(error);
    }
  }

  async validateToken(req: Request, res: Response, next: NextFunction){
    try{

      this.responseUtils.sendSuccessResponse(res, {'isValid': true});

    } catch(error: any){
      next(error);
    }
  }
}