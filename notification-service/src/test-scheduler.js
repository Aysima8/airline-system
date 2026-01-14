/**
 * Scheduler Manuel Test Scripti
 *
 * Kullanim:
 *   docker exec -it airline-notification-service node src/test-scheduler.js
 *
 * veya lokal:
 *   cd notification-service && node src/test-scheduler.js
 */

// Environment ayarla (Docker icinde calisacaksa)
process.env.FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://flight-service:3002';
process.env.TICKET_SERVICE_URL = process.env.TICKET_SERVICE_URL || 'http://ticket-service:3003';

const nightlyJob = require('./scheduler/nightly.job');

console.log('');
console.log('========================================');
console.log('   SCHEDULER MANUEL TEST BASLADI');
console.log('========================================');
console.log('');
console.log('Flight Service URL:', process.env.FLIGHT_SERVICE_URL);
console.log('Ticket Service URL:', process.env.TICKET_SERVICE_URL);
console.log('');

// Tum job'lari calistir
nightlyJob.runAllJobs()
  .then(() => {
    console.log('');
    console.log('========================================');
    console.log('   SCHEDULER MANUEL TEST TAMAMLANDI');
    console.log('========================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('========================================');
    console.error('   SCHEDULER TEST HATASI');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  });
