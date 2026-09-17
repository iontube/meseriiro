#!/bin/bash
# Cron zilnic: reia campaniile din API Profitshare. Deployeaza img.meseriile.ro DOAR daca
# banners.json s-a schimbat (ps-banners.mjs iese cu 10 = neschimbat, 0 = schimbat).
# Vezi reference_profitshare_api.
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
NODE=$(command -v node)
CREDS=/sites/_doorways/cf_meseriile_creds.json

cd /sites/meseriiro-work || exit 1
$NODE scripts/ps-banners.mjs
RC=$?
if [ "$RC" -eq 10 ]; then
  echo "[refresh-banners] $(date) neschimbat, skip deploy"
  exit 0
elif [ "$RC" -ne 0 ]; then
  echo "[refresh-banners] $(date) EROARE ps-banners.mjs rc=$RC"
  exit "$RC"
fi

export CLOUDFLARE_EMAIL=$($NODE -e "const c=require('$CREDS');console.log(c.CLOUDFLARE_EMAIL||c.email)")
export CLOUDFLARE_API_KEY=$($NODE -e "const c=require('$CREDS');console.log(c.CLOUDFLARE_API_KEY||c.api_key||c.key)")
export CLOUDFLARE_ACCOUNT_ID=$($NODE -e "const c=require('$CREDS');console.log(c.CLOUDFLARE_ACCOUNT_ID||c.account_id||c.account)")
cd /sites/meseriile-img-work || exit 1
npx -y wrangler@3 pages deploy . --project-name=meseriile-img --commit-dirty=true
echo "[refresh-banners] $(date) DEPLOYAT (campanie schimbata)"
