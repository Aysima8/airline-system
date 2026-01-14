const sequelize = require('./config/db');
const Flight = require('./models/flight.model');

const seedFlights = async () => {
  try {
    await sequelize.sync();

    // Önce mevcut uçuşları kontrol et
    const existingCount = await Flight.count();
    if (existingCount > 0) {
      console.log(`Veritabanında zaten ${existingCount} uçuş var. Seed atlanıyor.`);
      return;
    }

    const today = new Date();
    const flights = [];

    // Gelecek 30 gün için uçuşlar oluştur
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const flightDate = new Date(today);
      flightDate.setDate(flightDate.getDate() + dayOffset);
      const dateStr = flightDate.toISOString().split('T')[0].replace(/-/g, '');

      // IST -> AYT (Antalya)
      flights.push({
        flightNumber: `TK${dateStr}01`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'AYT',
        departureTime: new Date(flightDate.setHours(8, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(9, 30, 0)),
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
        departureTime: new Date(flightDate.setHours(14, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(15, 30, 0)),
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
        departureTime: new Date(flightDate.setHours(10, 30, 0)),
        arrivalTime: new Date(flightDate.setHours(12, 0, 0)),
        totalSeats: 186,
        availableSeats: 186,
        basePrice: 650,
        duration: 1.5,
        status: 'scheduled'
      });

      // AYT -> IST (Dönüş)
      flights.push({
        flightNumber: `TK${dateStr}03`,
        airline: 'Turkish Airlines',
        origin: 'AYT',
        destination: 'IST',
        departureTime: new Date(flightDate.setHours(11, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(12, 30, 0)),
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
        departureTime: new Date(flightDate.setHours(7, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(8, 15, 0)),
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
        departureTime: new Date(flightDate.setHours(18, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(19, 15, 0)),
        totalSeats: 150,
        availableSeats: 150,
        basePrice: 600,
        duration: 1.25,
        status: 'scheduled'
      });

      // IST -> ADB (İzmir)
      flights.push({
        flightNumber: `TK${dateStr}06`,
        airline: 'Turkish Airlines',
        origin: 'IST',
        destination: 'ADB',
        departureTime: new Date(flightDate.setHours(9, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(10, 15, 0)),
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
        departureTime: new Date(flightDate.setHours(16, 0, 0)),
        arrivalTime: new Date(flightDate.setHours(17, 15, 0)),
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
        departureTime: new Date(flightDate.setHours(6, 30, 0)),
        arrivalTime: new Date(flightDate.setHours(8, 15, 0)),
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
        departureTime: new Date(flightDate.setHours(11, 30, 0)),
        arrivalTime: new Date(flightDate.setHours(13, 0, 0)),
        totalSeats: 180,
        availableSeats: 180,
        basePrice: 800,
        duration: 1.5,
        status: 'scheduled'
      });
    }

    await Flight.bulkCreate(flights);
    console.log(`✅ ${flights.length} uçuş başarıyla eklendi!`);

  } catch (error) {
    console.error('Seed hatası:', error);
  } finally {
    process.exit(0);
  }
};

seedFlights();