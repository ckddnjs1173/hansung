import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME="hansung_session";
const enc=new TextEncoder();
const toB64Url=(bytes:ArrayBuffer)=>Buffer.from(bytes).toString("base64url");

async function valid(token:string|undefined){
  const secret=process.env.AUTH_SECRET?.trim();
  if(!token||!secret) return false;
  const [payload,sig]=token.split(".");
  if(!payload||!sig) return false;
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const expected=toB64Url(await crypto.subtle.sign("HMAC",key,enc.encode(payload)));
  if(expected!==sig) return false;
  try{const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {uid:number;exp:number};return Boolean(data.uid&&data.exp>Date.now());}catch{return false;}
}

export async function proxy(request:NextRequest){
  const path=request.nextUrl.pathname;
  if(path==="/login"||path.startsWith("/_next/")||path==="/favicon.ico") return NextResponse.next();
  if(!(await valid(request.cookies.get(COOKIE_NAME)?.value))){const url=request.nextUrl.clone();url.pathname="/login";url.searchParams.set("next",path);return NextResponse.redirect(url);}
  return NextResponse.next();
}

export const config={matcher:["/((?!api/health).*)"]};
