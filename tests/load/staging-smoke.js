// Execute ONLY on an isolated, explicitly authorized staging environment with synthetic data.
// Example: k6 run -e BASE_URL=https://isolated-staging.example.org tests/load/staging-smoke.js
import http from 'k6/http'
import { check, sleep } from 'k6'
export const options={vus:2,duration:'20s',thresholds:{http_req_failed:['rate<0.05'],http_req_duration:['p(95)<2000']}}
const base=__ENV.BASE_URL||''
if(!base || !/^https:\/\//.test(base) || /clinicaespiritual\.com|vercel\.app/.test(base)) throw Error('Isolated staging BASE_URL required; production and Vercel preview disallowed')
export default function(){const r=http.get(base+'/');check(r,{'public homepage responds':x=>x.status===200});sleep(1)}
