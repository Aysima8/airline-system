const sequelize = require('./config/db');
const Flight = require('./models/flight.model');
const Airport = require('./models/airport.model');

// Yardimci fonksiyon: Belirli bir tarih ve saat icin yeni Date objesi olustur
const createDateTime = (baseDate, hours, minutes = 0) => {
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const reseed = async () => {
  try {
    console.log('Veritabani baglantisi kuruluyor...');
    await sequelize.authenticate();
    console.log('Veritabani baglantisi basarili!');

    // Sync tabloları
    await sequelize.sync();

    // Mevcut verileri sil
    console.log('Mevcut ucuslar siliniyor...');
    await Flight.destroy({ where: {}, truncate: true, cascade: true });
    console.log('Mevcut ucuslar silindi.');

    console.log('Mevcut havaalanlari siliniyor...');
    await Airport.destroy({ where: {}, truncate: true, cascade: true });
    console.log('Mevcut havaalanlari silindi.');

    // Havaalanlarini ekle
    const airports = [
      { code: 'IST', name: 'Istanbul Havalimani', city: 'Istanbul', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'SAW', name: 'Sabiha Gokcen Havalimani', city: 'Istanbul', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'AYT', name: 'Antalya Havalimani', city: 'Antalya', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'ADB', name: 'Adnan Menderes Havalimani', city: 'Izmir', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'ESB', name: 'Esenboga Havalimani', city: 'Ankara', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'TZX', name: 'Trabzon Havalimani', city: 'Trabzon', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'DLM', name: 'Dalaman Havalimani', city: 'Mugla', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'BJV', name: 'Milas-Bodrum Havalimani', city: 'Mugla', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'GZT', name: 'Gaziantep Havalimani', city: 'Gaziantep', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'VAN', name: 'Van Ferit Melen Havalimani', city: 'Van', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'DIY', name: 'Diyarbakir Havalimani', city: 'Diyarbakir', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'ERZ', name: 'Erzurum Havalimani', city: 'Erzurum', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'KYA', name: 'Konya Havalimani', city: 'Konya', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'SZF', name: 'Samsun Carsamba Havalimani', city: 'Samsun', country: 'Turkiye', timezone: 'Europe/Istanbul' },
      { code: 'ASR', name: 'Kayseri Erkilet Havalimani', city: 'Kayseri', country: 'Turkiye', timezone: 'Europe/Istanbul' }
    ];

    await Airport.bulkCreate(airports);
    console.log(`${airports.length} havalimani eklendi!`);

    // Ucuslari ekle
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const flights = [];

    // Gelecek 60 gun icin ucuslar olustur
    for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
      const flightDate = new Date(today);
      flightDate.setDate(flightDate.getDate() + dayOffset);
      const dateStr = flightDate.toISOString().split('T')[0].replace(/-/g, '');

      // IST -> AYT (Antalya)
      flights.push({
        flightNumber: `TK${dateStr}01`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'AYT',
        departureTime: createDateTime(flightDate, 8, 0),
        arrivalTime: createDateTime(flightDate, 9, 30),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 850,
        duration: 1.5,
        status: 'scheduled'
      });

      flights.push({
        flightNumber: `TK${dateStr}02`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'AYT',
        departureTime: createDateTime(flightDate, 14, 0),
        arrivalTime: createDateTime(flightDate, 15, 30),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 950,
        duration: 1.5,
        status: 'scheduled'
      });

      flights.push({
        flightNumber: `PC${dateStr}01`,
        airline: 'Pegasus',
        origin: 'IST',
        destination: 'AYT',
        departureTime: createDateTime(flightDate, 10, 30),
        arrivalTime: createDateTime(flightDate, 12, 0),
        totalSeats: 186,
        availableSeats: 186,
        basePrice: 650,
        duration: 1.5,
        status: 'scheduled'
      });

      // AYT -> IST (Donus)
      flights.push({
        flightNumber: `TK${dateStr}03`,
        airline: 'Turkish Airlines',
        origin: 'AYT',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 11, 0),
        arrivalTime: createDateTime(flightDate, 12, 30),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 850,
        duration: 1.5,
        status: 'scheduled'
      });

      // IST -> ESB (Ankara)
      flights.push({
        flightNumber: `TK${dateStr}04`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'ESB',
        departureTime: createDateTime(flightDate, 7, 0),
        arrivalTime: createDateTime(flightDate, 8, 15),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 550,
        duration: 1.25,
        status: 'scheduled'
      });

      flights.push({
        flightNumber: `TK${dateStr}05`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'ESB',
        departureTime: createDateTime(flightDate, 18, 0),
        arrivalTime: createDateTime(flightDate, 19, 15),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 600,
        duration: 1.25,
        status: 'scheduled'
      });

      // ESB -> IST (Ankara Donus)
      flights.push({
        flightNumber: `TK${dateStr}09`,
        airline: 'Turkish Airlines',
        origin: 'ESB',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 9, 30),
        arrivalTime: createDateTime(flightDate, 10, 45),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 550,
        duration: 1.25,
        status: 'scheduled'
      });

      // IST -> ADB (Izmir)
      flights.push({
        flightNumber: `TK${dateStr}06`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'ADB',
        departureTime: createDateTime(flightDate, 9, 0),
        arrivalTime: createDateTime(flightDate, 10, 15),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 600,
        duration: 1.25,
        status: 'scheduled'
      });

      flights.push({
        flightNumber: `PC${dateStr}02`,
        airline: 'Pegasus',
        origin: 'IST',
        destination: 'ADB',
        departureTime: createDateTime(flightDate, 16, 0),
        arrivalTime: createDateTime(flightDate, 17, 15),
        totalSeats: 186,
        availableSeats: 186,
        basePrice: 450,
        duration: 1.25,
        status: 'scheduled'
      });

      // ADB -> IST (Izmir Donus)
      flights.push({
        flightNumber: `TK${dateStr}10`,
        airline: 'Turkish Airlines',
        origin: 'ADB',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 12, 0),
        arrivalTime: createDateTime(flightDate, 13, 15),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 600,
        duration: 1.25,
        status: 'scheduled'
      });

      flights.push({
        flightNumber: `PC${dateStr}03`,
        airline: 'Pegasus',
        origin: 'ADB',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 19, 0),
        arrivalTime: createDateTime(flightDate, 20, 15),
        totalSeats: 186,
        availableSeats: 186,
        basePrice: 450,
        duration: 1.25,
        status: 'scheduled'
      });

      // IST -> TZX (Trabzon)
      flights.push({
        flightNumber: `TK${dateStr}07`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'TZX',
        departureTime: createDateTime(flightDate, 6, 30),
        arrivalTime: createDateTime(flightDate, 8, 15),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 700,
        duration: 1.75,
        status: 'scheduled'
      });

      // TZX -> IST (Trabzon Donus)
      flights.push({
        flightNumber: `TK${dateStr}11`,
        airline: 'Turkish Airlines',
        origin: 'TZX',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 10, 0),
        arrivalTime: createDateTime(flightDate, 11, 45),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 700,
        duration: 1.75,
        status: 'scheduled'
      });

      // IST -> DLM (Dalaman)
      flights.push({
        flightNumber: `TK${dateStr}08`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'DLM',
        departureTime: createDateTime(flightDate, 11, 30),
        arrivalTime: createDateTime(flightDate, 13, 0),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 800,
        duration: 1.5,
        status: 'scheduled'
      });

      // DLM -> IST (Dalaman Donus)
      flights.push({
        flightNumber: `TK${dateStr}12`,
        airline: 'Turkish Airlines',
        origin: 'DLM',
        destination: 'IST',
        departureTime: createDateTime(flightDate, 15, 0),
        arrivalTime: createDateTime(flightDate, 16, 30),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 800,
        duration: 1.5,
        status: 'scheduled'
      });
    }

    await Flight.bulkCreate(flights);
    console.log(`${flights.length} ucus basariyla eklendi!`);

    console.log('\n=== RESEED TAMAMLANDI ===');
    console.log(`Toplam ${airports.length} havalimani`);
    console.log(`Toplam ${flights.length} ucus`);

  } catch (error) {
    console.error('Reseed hatasi:', error);
  } finally {
    process.exit(0);
  }
};

reseed();
