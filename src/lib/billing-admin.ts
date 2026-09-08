import "server-only";
import { withDatabase } from "@/lib/database";

export function reopenBillingRun(id:number){withDatabase(db=>{const row=db.prepare("SELECT status FROM app_billing_runs WHERE id=?").get(id) as {status?:string}|undefined;if(!row) throw new Error("청구회차를 찾을 수 없습니다.");if(row.status!=="마감") throw new Error("마감된 청구회차만 해제할 수 있습니다.");db.prepare("UPDATE app_billing_runs SET status='검토',closed_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);});}
