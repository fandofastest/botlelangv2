const axios = require('axios');

// Semua konfigurasi dan kredensial dimasukkan ke dalam satu objek config
// agar mudah di-passing ke fungsi dan siap multi-thread
const defaultConfig = {
  API_LOGIN_URL: 'https://api-auth.lelang.go.id/api/v1/login',
  USERNAME: 'mirzahanpratama@gmail.com',
  PASSWORD: 'Jatiwaringinpondokgede16#',
  BID_API_URL: 'https://bidding.lelang.go.id/api/v1/pelaksanaan/lelang/pengajuan-penawaran',
  AUCTION_ID: '6a353963-ede2-48cb-b035-1b1330c77f67',
  PASSKEY: '032687',
  expectedUserAuctionId: '7e5a56a6-84fc-4269-8376-4df98832cfff',
  scriptStartTime: '2025-07-02T14:10:00+07:00', // Example start time in ISO format
};

async function loginUser(config) {
  try {
    console.log('Login user...');
    const response = await axios.post(
      config.API_LOGIN_URL,
      {
        username: config.USERNAME,
        password: config.PASSWORD
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('Terjadi error saat login:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Fungsi untuk mengirim bid menggunakan token yang didapatkan dari fungsi login.
 * @param {string} authToken - Token otorisasi dari login.
 */
/**
 * Fungsi untuk mendapatkan detail lelang
 * @param {string} authToken - Token otorisasi dari login
 */
async function getAuctionDetails(authToken, config) {
  const url = `https://api.lelang.go.id/api/v1/pelaksanaan/${config.AUCTION_ID}/status-lelang?dcp=true`;
  
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'Connection': 'keep-alive',
    'Origin': 'https://lelang.go.id',
    'Referer': 'https://lelang.go.id/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.data.lotLelang;
  } catch (error) {
    console.error('Gagal mendapatkan detail lelang:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function sendBid(authToken, lastBid, config) {
  // Dapatkan detail lelang
  const auctionDetails = await getAuctionDetails(authToken, config);
  if (!auctionDetails) {
    console.error('Tidak dapat mendapatkan detail lelang');
    return;
  }

  // Hitung bid baru
  const currentBid = parseFloat(lastBid> auctionDetails.nilaiLimit? lastBid : auctionDetails.nilaiLimit);
  const bidIncrement = parseFloat(auctionDetails.kelipatanBid);
  const newBid = currentBid + bidIncrement;

  // Mempersiapkan payload data untuk bid
  const data = {
    auctionId: config.AUCTION_ID,
    bidAmount: newBid,
    passkey: config.PASSKEY,
    bidTime: new Date().toISOString()
  };

  // Menyiapkan header, menggunakan token dari parameter
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Origin': 'https://lelang.go.id',
    'Referer': 'https://lelang.go.id/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/135.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };
  console.log('kirim'+newBid);

  try {
    const response = await axios.post(config.BID_API_URL, data, { headers });
    
    console.log('Pengajuan bid berhasil:', response.data);
  } catch (error) {

    console.error('Terjadi error saat mengajukan bid:', error.response ? error.response.data : error.message);
  }
}

/**
 * Fungsi untuk mengambil riwayat bid (getHistory) menggunakan token.
 * @param {string} authToken - Token otorisasi dari hasil login.
 */
/**
 * Fungsi untuk memulai sesi baru
 * @param {string} authToken - Token otorisasi dari login
 */
async function startSession(authToken, config) {
  const startSessionUrl = 'https://bidding.lelang.go.id/api/v1/pelaksanaan/lelang/mulai-sesi';
  
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Origin': 'https://lelang.go.id',
    'Referer': 'https://lelang.go.id/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };

  const data = {
    auctionId: config.AUCTION_ID
  };

  try {
    const response = await axios.post(startSessionUrl, data, { headers });
    console.log('Sesi baru berhasil dimulai');

    // Ambil tanggal endTime dari response
    const endTime = new Date(response.data.data.endTime.date + ' GMT+7');

    // Log waktu sekarang dan waktu start
    const now = new Date();
    console.log(`Waktu sekarang: ${now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`Waktu mulai lelang: ${endTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}`);

    // Set interval untuk memeriksa waktu tersisa
    const timeLeft = endTime - now;

    // Jika waktu tersisa kurang dari atau sama dengan 30 detik, jalankan getHistory
    // if (timeLeft <= 10000 && timeLeft > 0) {
    //   console.log(`Waktu tersisa hingga eksekusi: ${timeLeft / 1000} detik`);
    //   await getHistory(authToken);
    // }
    await getHistory(authToken, config, config.expectedUserAuctionId);
    return true;
  } catch (error) {
    console.error('Gagal memulai sesi baru:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getHistory(authToken, config, expectedUserAuctionId) {
  const getHistoryUrl = `https://bidding.lelang.go.id/api/v1/pelaksanaan/lelang/${config.AUCTION_ID}/riwayat`;

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Authorization': `Bearer ${authToken}`,
    'Connection': 'keep-alive',
    'Origin': 'https://lelang.go.id',
    'Referer': 'https://lelang.go.id/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/135.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };

  try {
    const response = await axios.get(getHistoryUrl, { headers });
    
    // Tampilkan userAuctionId dari data pertama
    if (response.data.data && response.data.data.length > 0) {
      const firstBid = response.data.data[0];
      console.log('User Auction ID:', firstBid.userAuctionId);
      
      // Cek apakah auction ID sesuai
      if (firstBid.userAuctionId !== expectedUserAuctionId) {
        console.log('Ini bukan auction Anda!');
        console.log('lastbid: ' + firstBid.bidAmount);
        
        sendBid(authToken, firstBid.bidAmount, config);
        return;
      }
      else {
        console.log('anda last bid'); 
        console.log('lastbid: ' + firstBid.bidAmount);
      }
    } else {
      console.log('Belum ada data bid');
      return;
    }
    
  } catch (error) {
    if (error.response?.data?.message === 'UAS_404') {
      console.log('Sesi expired, mencoba memulai sesi baru...');
      const sessionStarted = await startSession(authToken, config);
      if (sessionStarted) {
        // Coba ambil history lagi setelah sesi baru dimulai
        await getHistory(authToken, config, expectedUserAuctionId);
      }
    } else {
      console.error('Terjadi error saat mengambil riwayat bid:', error.response ? error.response.data : error.message);
    }
  }
}

/**
 * Fungsi utama yang menggabungkan proses login dan pemanggilan fungsi bid atau history.
 */
// Fungsi utama tanpa variabel global
async function main(config, lastBid = null, expectedUserAuctionId = '') {
  let authToken = null;
  let auctionDetails = null;
  try {
    // Selalu login untuk mendapatkan token baru
    authToken = await loginUser(config);
    // Dapatkan detail lelang
    auctionDetails = await getAuctionDetails(authToken, config);
    if (!auctionDetails) {
      throw new Error('Gagal mendapatkan detail lelang');
    }
    await startSession(authToken, config);
    // Contoh: Kirim bid jika lastBid diberikan
    // if (lastBid !== null) {
    //   await sendBid(authToken, lastBid, config);
    // }
    // Contoh: Ambil history
    await getHistory(authToken, config, expectedUserAuctionId);
    return { authToken, auctionDetails };
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Token expired, melakukan login ulang...');
      // Rekursif login ulang
      return await main(config, lastBid, expectedUserAuctionId);
    } else {
      console.error('Proses gagal:', error);
      throw error;
    }
  }
}

function pollingHistoryFixed(config, delayMs = 5000) {
  let authToken = null;
  let pollingActive = true;
  async function poll() {
    if (!pollingActive) return;
    try {
      if (!authToken) {
        authToken = await loginUser(config);
      }
      await getHistory(authToken, config, config.expectedUserAuctionId);
    } catch (err) {
      console.error('Polling error:', err.message);
      authToken = null;
    }
    setTimeout(poll, delayMs);
  }
  poll();
}

function adaptivePollingHistory(config, auctionEndTime) {
  let authToken = null;
  let pollingActive = true;
  async function poll() {
    if (!pollingActive) return;
    try {
      if (!authToken) {
        authToken = await loginUser(config);
      }
      await getHistory(authToken, config, config.expectedUserAuctionId);
    } catch (err) {
      console.error('Polling error:', err.message);
      authToken = null;
    }

    const now = new Date();
    const end = new Date(auctionEndTime);
    const msLeft = end - now;
    let nextDelay = 30000; // default 30 detik
    if (msLeft > 5 * 60 * 1000) {
      nextDelay = 2 * 60 * 1000;
    } else if (msLeft > 30 * 1000) {
      nextDelay = 30000;
    } else if (msLeft > 5 * 1000) {
      nextDelay = 1000;
    } else if (msLeft > 0) {
      nextDelay = 100;
    } else {
      pollingActive = false;
      console.log('Auction has ended, stop polling.');
      return;
    }
    setTimeout(poll, nextDelay);
  }
  poll();
}



function checkAndRunMain(startTime, config, lastBid = null, expectedUserAuctionId = '', skipTimeCheck = false) {
  if (skipTimeCheck) {
    console.log('Starting main function immediately (skip time check)...');
    main(config, lastBid, expectedUserAuctionId).then(() => {
      pollingHistoryFixed(config, 100); // polling 5 detik sekali
    });
    return;
  }
  const interval = setInterval(() => {
    const now = new Date();
    const start = new Date(startTime);
    if (now >= start) {
      console.log('Starting main function...');
      clearInterval(interval); // Stop checking once the condition is met
      main(config, lastBid, expectedUserAuctionId).then(() => {
        adaptivePollingHistory(config, config.scriptStartTime);
      });
    } else {
      const timeLeft = start - now;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      console.log(`Time left until start: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
      console.log('now' + now);
    }
  }, 100); // Check every 100 ms
}




// Sample: Jalankan 2 instance paralel dengan config berbeda
const configUser1 = {
  ...defaultConfig,
  USERNAME: 'mirzahanpratama@gmail.com',
  PASSWORD: 'Jatiwaringinpondokgede16#',
  expectedUserAuctionId: '7e5a56a6-84fc-4269-8376-4df98832cfff',
  PASSKEY: '032687', // PASSKEY khusus user 1
  AUCTION_ID: '6a353963-ede2-48cb-b035-1b1330c77f67', // AUCTION_ID khusus user 1
  scriptStartTime: '2025-08-14T10:27:00+07:00' // atau waktu berbeda jika mau
};

const configUser2 = {
  ...defaultConfig,
  USERNAME: 'mirzahanpratama@gmail.com',
  PASSWORD: 'Jatiwaringinpondokgede16#',
  expectedUserAuctionId: 'b28bc6d3-43cd-41b8-9ea5-5b389f7fee23', // ganti sesuai userAuctionId user kedua
  PASSKEY: '479026', // PASSKEY khusus user 2
  AUCTION_ID: 'f15aa507-cb58-4129-9128-75bb730f782f', // AUCTION_ID khusus user 2
  scriptStartTime: '2025-08-14T10:27:00+07:00' // atau waktu berbeda jika mau
};


const configUser3 = {
    ...defaultConfig,
    USERNAME: 'mirzahanpratama@gmail.com',
    PASSWORD: 'Jatiwaringinpondokgede16#',
    expectedUserAuctionId: '26e88374-768c-4fdb-90c5-6c184aca3b15', // ganti sesuai userAuctionId user kedua
    PASSKEY: '074512', // PASSKEY khusus user 2
    AUCTION_ID: 'f833b8bf-bfcd-48d3-9f93-11934f86a271', // AUCTION_ID khusus user 2
    scriptStartTime: '2025-08-14T10:27:00+07:00' // atau waktu berbeda jika mau
  };

// Contoh: jalankan dengan cek waktu (default)
// checkAndRunMain(configUser1.scriptStartTime, configUser1, null, configUser1.expectedUserAuctionId);
// checkAndRunMain(configUser2.scriptStartTime, configUser2, null, configUser2.expectedUserAuctionId);

// Contoh: jalankan langsung tanpa cek waktu
checkAndRunMain(configUser1.scriptStartTime, configUser1, null, configUser1.expectedUserAuctionId, false);
checkAndRunMain(configUser2.scriptStartTime, configUser2, null, configUser2.expectedUserAuctionId, false);
checkAndRunMain(configUser3.scriptStartTime, configUser3, null, configUser3.expectedUserAuctionId, false);
