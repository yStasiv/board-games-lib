import { NextResponse } from "next/server";
import { clearEditorSession, createEditorSession, sameSiteRequest, validPin } from "@/lib/auth";

export async function POST(request:Request){
  if(!sameSiteRequest(request))return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await request.json().catch(()=>null) as {pin?:unknown}|null;
  if(!body||typeof body.pin!=="string"||!validPin(body.pin))return NextResponse.json({error:"Invalid PIN"},{status:401});
  await createEditorSession(); return NextResponse.json({ok:true});
}
export async function DELETE(request:Request){if(!sameSiteRequest(request))return NextResponse.json({error:"Forbidden"},{status:403});await clearEditorSession();return NextResponse.json({ok:true})}
