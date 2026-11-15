import { env } from "cloudflare:workers";

export type GameInput = { title:string; playersMin:number; playersMax:number; duration:number; age:number; category:string; language:string; shelf:string; status:"available"|"borrowed"; notes:string; imageUrl:string };
type GameRow = { id:string; title:string; players_min:number; players_max:number; duration:number; age:number; category:string; language:string; shelf:string; status:"available"|"borrowed"; notes:string; image_url:string; created_at:string; updated_at:string };
const columns = "id,title,players_min,players_max,duration,age,category,language,shelf,status,notes,image_url,created_at,updated_at";

function db(){ if(!env.DB) throw new Error("D1 binding DB is unavailable"); return env.DB; }
function game(row:GameRow){return {id:row.id,title:row.title,playersMin:row.players_min,playersMax:row.players_max,duration:row.duration,age:row.age,category:row.category,language:row.language,shelf:row.shelf,status:row.status,notes:row.notes,imageUrl:row.image_url,createdAt:row.created_at,updatedAt:row.updated_at}}
export async function listGames(filters:{q?:string;category?:string;players?:number}={}){
  const where:string[]=[]; const values:(string|number)[]=[];
  if(filters.q){where.push("(title LIKE ? OR category LIKE ? OR notes LIKE ? OR shelf LIKE ?)");const q=`%${filters.q.replace(/[\\%_]/g,"\\$&")}%`;values.push(q,q,q,q)}
  if(filters.category){where.push("category = ?");values.push(filters.category)}
  if(filters.players){where.push("players_min <= ? AND players_max >= ?");values.push(filters.players,filters.players)}
  const sql=`SELECT ${columns} FROM games ${where.length?`WHERE ${where.join(" AND ")}`:""} ORDER BY title COLLATE NOCASE`;
  const result=await db().prepare(sql).bind(...values).all<GameRow>(); return result.results.map(game);
}
export async function addGame(input:GameInput){const id=crypto.randomUUID(),now=new Date().toISOString();await db().prepare("INSERT INTO games (id,title,players_min,players_max,duration,age,category,language,shelf,status,notes,image_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,input.title,input.playersMin,input.playersMax,input.duration,input.age,input.category,input.language,input.shelf,input.status,input.notes,input.imageUrl,now,now).run();return id}
export async function updateGame(id:string,input:GameInput){return db().prepare("UPDATE games SET title=?,players_min=?,players_max=?,duration=?,age=?,category=?,language=?,shelf=?,status=?,notes=?,image_url=?,updated_at=? WHERE id=?").bind(input.title,input.playersMin,input.playersMax,input.duration,input.age,input.category,input.language,input.shelf,input.status,input.notes,input.imageUrl,new Date().toISOString(),id).run()}
export async function deleteGame(id:string){return db().prepare("DELETE FROM games WHERE id=?").bind(id).run()}
