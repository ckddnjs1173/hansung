"use server";
import { redirect } from "next/navigation";
import { auditAs,requireUser } from "@/lib/auth";
import { withDatabase } from "@/lib/database";
const t=(f:FormData,k:string)=>String(f.get(k)??"").trim();const n=(f:FormData,k:string)=>Number(t(f,k)||0);const b=(f:FormData,k:string)=>f.get(k)?1:0;

export async function completeOnboarding(form:FormData){
  const user=await requireUser();
  const name=t(form,"name"),joined=t(form,"joined_at"),siteId=n(form,"site_id"),jobId=n(form,"job_id"),contractStart=t(form,"contract_started_at"),contractEnd=t(form,"contract_ended_at"),employeeNo=t(form,"employee_no"),phone=t(form,"phone");
  if(!name||!joined||!siteId||!jobId||!contractStart||!contractEnd)throw new Error("성명, 입사일, 지점, 직무, 계약기간은 필수입니다.");
  if(contractEnd<contractStart)throw new Error("계약 종료일은 시작일보다 빠를 수 없습니다.");
  const result=withDatabase(db=>{
    db.exec("BEGIN IMMEDIATE");
    try{
      if(employeeNo){const sameNo=db.prepare("SELECT id FROM app_workers WHERE employee_no=?").get(employeeNo) as {id?:number}|undefined;if(sameNo)throw new Error("이미 등록된 사번입니다.");}
      const duplicate=db.prepare("SELECT id FROM app_workers WHERE name=? AND COALESCE(phone,'')=COALESCE(?, '') AND status<>'퇴사'").get(name,phone||null) as {id?:number}|undefined;
      if(duplicate)throw new Error("동일 성명·연락처의 재직/입사예정 인력이 이미 있습니다.");
      const site=db.prepare("SELECT id FROM app_sites WHERE id=? AND operation_status='운영'").get(siteId);if(!site)throw new Error("운영 중인 지점을 선택해 주세요.");
      const job=db.prepare("SELECT id FROM app_jobs WHERE id=? AND is_active=1").get(jobId);if(!job)throw new Error("사용 가능한 직무를 선택해 주세요.");
      const payRuleId=n(form,"pay_rule_id")||null;
      if(payRuleId){const rule=db.prepare("SELECT id,job_id,site_id FROM app_pay_rules WHERE id=? AND status='적용'").get(payRuleId) as {id:number;job_id:number;site_id:number|null}|undefined;if(!rule||rule.job_id!==jobId||(rule.site_id&&rule.site_id!==siteId))throw new Error("선택한 급여기준이 지점·직무와 맞지 않습니다.");}
      const today=new Date().toISOString().slice(0,10);const future=joined>today;
      const wr=db.prepare(`INSERT INTO app_workers(employee_no,name,birth_date,phone,email,address,joined_at,status,note) VALUES(?,?,?,?,?,?,?,?,?)`).run(employeeNo||null,name,t(form,"birth_date")||null,phone||null,t(form,"email")||null,t(form,"address")||null,joined,future?"입사예정":"재직",t(form,"note")||null);const workerId=Number(wr.lastInsertRowid);
      const ar=db.prepare(`INSERT INTO app_assignments(worker_id,site_id,job_id,work_type,started_at,status,pay_rule_id,note) VALUES(?,?,?,?,?,?,?,?)`).run(workerId,siteId,jobId,t(form,"work_type")||"주중",joined,future?"예정":"활성",payRuleId,t(form,"assignment_note")||null);const assignmentId=Number(ar.lastInsertRowid);
      const cr=db.prepare(`INSERT INTO app_contracts(worker_id,assignment_id,contract_type,sequence_no,started_at,ended_at,status,note) VALUES(?,?,?,?,?,?,?,?)`).run(workerId,assignmentId,"최초",1,contractStart,contractEnd,contractStart>today?"예정":"유효",t(form,"contract_note")||null);const contractId=Number(cr.lastInsertRowid);
      const or=db.prepare(`INSERT INTO app_onboarding_runs(worker_id,assignment_id,contract_id,pay_rule_id,contract_document_checked,privacy_document_checked,dispatch_document_checked,onboarding_document_checked,created_by_user_id) VALUES(?,?,?,?,?,?,?,?,?)`).run(workerId,assignmentId,contractId,payRuleId,b(form,"contract_document"),b(form,"privacy_document"),b(form,"dispatch_document"),b(form,"onboarding_document"),user.id);
      db.exec("COMMIT");return {workerId,onboardingId:Number(or.lastInsertRowid)};
    }catch(error){db.exec("ROLLBACK");throw error;}
  });
  auditAs(user,"create","onboarding",result.onboardingId,`${name} 입사·배치 일괄 등록`);
  redirect(`/workers/${result.workerId}`);
}
