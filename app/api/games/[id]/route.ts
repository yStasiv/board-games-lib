import { NextResponse } from "next/server";
import { canEdit, sameSiteRequest } from "@/lib/auth";
import { deleteGame, updateGame } from "@/lib/games";
import { gameSchema } from "@/lib/validation";

async function allowed(request:Request){return sameSiteRequest(request)&&await canEdit()}
export async function PUT(request:Request,context:{params:Promise<{id:string}>}){if(!await allowed(request))return NextResponse.json({error:"Потрібно знову ввести PIN-код"},{status:401});const parsed=gameSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Перевір введені дані"},{status:400});try{const {id}=await context.params;await updateGame(id,parsed.data);return NextResponse.json({ok:true})}catch(error){console.error("games.update",error);return NextResponse.json({error:"Не вдалося зберегти зміни"},{status:503})}}
export async function DELETE(request:Request,context:{params:Promise<{id:string}>}){if(!await allowed(request))return NextResponse.json({error:"Unauthorized"},{status:401});try{const {id}=await context.params;await deleteGame(id);return NextResponse.json({ok:true})}catch(error){console.error("games.delete",error);return NextResponse.json({error:"Не вдалося видалити гру"},{status:503})}}
