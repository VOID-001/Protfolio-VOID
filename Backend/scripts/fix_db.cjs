const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_UZTPyuYO3ld9@ep-patient-breeze-a11ughr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
client.connect().then(async () => {
  try {
    const res1 = await client.query("DELETE FROM skills WHERE name IN ('Deep Learning', 'LLM Orchestration', 'Backend Systems', 'Frontend Engineering', 'MLOps / DevOps')");
    console.log('Deleted default skills:', res1.rowCount);
    const res2 = await client.query("DELETE FROM experiences WHERE role IN ('AI/ML Engineer', 'ML Research Intern')");
    console.log('Deleted default experiences:', res2.rowCount);
  } catch(e) { console.error(e) }
  client.end();
});
