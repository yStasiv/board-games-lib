import { z } from "zod";

export const gameSchema=z.object({
  title:z.string().trim().min(1).max(100),playersMin:z.number().int().min(1).max(30),playersMax:z.number().int().min(1).max(30),duration:z.number().int().min(1).max(1440),age:z.number().int().min(0).max(99),category:z.string().trim().min(1).max(60),language:z.string().trim().min(1).max(40),shelf:z.string().trim().min(1).max(80),status:z.enum(["available","borrowed"]),notes:z.string().trim().max(500),imageUrl:z.union([z.literal(""),z.string().url().max(1000)])
}).refine((value)=>value.playersMin<=value.playersMax,{message:"Invalid player range"});
