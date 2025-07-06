import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ResponseUtils from "../utils/response.utils";
import IProductService from "../services/Interfaces/IProductService";

@injectable()
export default class AIController {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @inject("responseUtils") private responseUtils: ResponseUtils,
    @inject("IProductService") private productService: IProductService
  ) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateSocialCaptions(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId;
      
      // Get product details
      const product = await this.productService.findById(productId);
      if (!product) {
        return this.responseUtils.sendErrorResponse(res, "Product not found", 404);
      }

      // Extract only the necessary information
      const productData = {
        product_name: product.name,
        description: product.description,
        key_features: [
          product.description, // Using description as first feature
          `السعر ${product.price} د.ج`, // Price as feature
          product.inventory_count > 0 ? "متوفر في المخزون" : "نفذت الكمية" // Availability as feature
        ],
        price: `${product.price} د.ج`,
        availability: product.inventory_count > 0 ? "متوفرة" : "غير متوفرة"
      };

      const prompt = `Return ONLY a raw JSON object (no markdown, no backticks, no formatting) with exactly these three keys: "ar", "fr", "kab" for social media captions.

      Product: ${productData.product_name}
      Price: ${productData.price}
      Features: ${productData.key_features.join(', ')}

      Each caption must:
      - Be under 50 words
      - Include product name
     - End with these exact phrases:
        ar: "طلب دابا 🚀"
        fr: "Découvrez ⭐"
        kab: "ساغ 🎉"

      Return EXACTLY like this (no other text):
      {"ar":"caption طلب دابا 🚀","fr":"caption Découvrez ⭐","kab":"caption ساغ 🎉"}`;

      const result = await this.model.generateContent({
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const response = await result.response;
      let captions;
      
      try {
        captions = JSON.parse(response.text());
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        return this.responseUtils.sendErrorResponse(
          res, 
          "Failed to generate valid captions", 
          500
        );
      }

      // Validate response structure
      if (!captions.ar || !captions.fr || !captions.kab) {
        return this.responseUtils.sendErrorResponse(
          res, 
          "Generated captions are incomplete", 
          500
        );
      }
      
      this.responseUtils.sendSuccessResponse(res, captions);
    } catch (error: any) {
      console.error("AI Caption Generation Error:", error);
      next(error);
    }
  }

  async generateResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return this.responseUtils.sendErrorResponse(
          res,
          "Prompt is required",
          400
        );
      }

      // Format request to match API structure
      const result = await this.model.generateContent({
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const response = await result.response;
      const text = response.text();

      this.responseUtils.sendSuccessResponse(res, { response: text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      next(error);
    }
  }
}
