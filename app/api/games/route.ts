import { NextResponse } from "next/server";
import { canEdit, sameSiteRequest } from "@/lib/auth";
import { addGame, listGames } from "@/lib/games";
import { gameSchema } from "@/lib/validation";
import { listCategories } from "@/lib/categories";

export async function GET(request:Request){try{const url=new URL(request.url);const players=Number(url.searchParams.get("players"));const [games,categories]=await Promise.all([listGames({q:url.searchParams.get("q")||undefined,category:url.searchParams.get("category")||undefined,players:Number.isFinite(players)&&players>0?players:undefined}),listCategories()]);return NextResponse.json({games,categories,canEdit:await canEdit()})}catch(error){console.error("games.list",error);return NextResponse.json({error:"Catalog unavailable"},{status:503})}}
export async function POST(request:Request){if(!sameSiteRequest(request))return NextResponse.json({error:"Forbidden"},{status:403});if(!await canEdit())return NextResponse.json({error:"Потрібно знову ввести PIN-код"},{status:401});const parsed=gameSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Перевір введені дані"},{status:400});try{return NextResponse.json({id:await addGame(parsed.data)},{status:201})}catch(error){console.error("games.create",error);return NextResponse.json({error:"Не вдалося зберегти гру"},{status:503})}}
