const { runNightlyJob } = require('../scheduler/nightly.job');

(async () => {
  try {
    await runNightlyJob();
    console.log('✅ Scheduler manually triggered');
    process.exit(0);
  } catch (err) {
    console.error('❌ Manual scheduler run failed:', err);
    process.exit(1);
  }
})();
