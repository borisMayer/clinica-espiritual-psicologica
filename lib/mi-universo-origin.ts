/** Reject browser cross-origin mutations, using the public request URL supplied by Vercel. */
export function sameOrigin(req:Request):boolean {
 const origin=req.headers.get('origin')
 if(!origin)return false
 try{
  const url=new URL(req.url)
  const source=new URL(origin)
  const forwarded=req.headers.get('x-forwarded-host')
  const host=forwarded||req.headers.get('host')||url.host
  return source.protocol==='https:'&&source.host===host
 }catch{return false}
}
