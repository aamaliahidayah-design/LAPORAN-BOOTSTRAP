
// Fungsi untuk mengambil data dari LocalStorage
function ambilDataNilai() {
    var data = localStorage.getItem('dataNilai');
    if (data === null) {
        return [];
    }
    return JSON.parse(data);
}

// Fungsi untuk menyimpan data ke LocalStorage
function simpanDataNilai(data) {
    localStorage.setItem('dataNilai', JSON.stringify(data));
}

// Fungsi untuk menentukan Grade berdasarkan Nilai Angka
function tentukanGrade(nilai) {
    if (nilai >= 85) return 'A';
    if (nilai >= 80) return 'A-';
    if (nilai >= 75) return 'B+';
    if (nilai >= 70) return 'B';
    if (nilai >= 65) return 'B-';
    if (nilai >= 60) return 'C+';
    if (nilai >= 55) return 'C';
    if (nilai >= 40) return 'D';
    return 'E';
}

// Fungsi untuk menentukan warna badge Bootstrap berdasarkan Grade
function warnaBadgeGrade(grade) {
    if (grade === 'A' || grade === 'A-') return 'bg-success';
    if (grade.startsWith('B')) return 'bg-primary';
    if (grade.startsWith('C')) return 'bg-info text-dark';
    if (grade === 'D') return 'bg-warning text-dark';
    return 'bg-danger';
}

// Fungsi tantangan 2 untuk menentukan Status Lulus
function tentukanStatusLulus(grade) {
    if (grade === 'E') {
        return '<span class="badge bg-danger">Tidak Lulus</span>';
    } else {
        return '<span class="badge bg-success">Lulus</span>';
    }
}

// Fungsi untuk menghitung nilai IPK / IPS secara akurat
function hitungIpk(arrayData) {
    if (!arrayData || arrayData.length === 0) return '-';

    var totalSks = 0;
    var totalBobotSks = 0;

    var bobotNilai = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0.0
    };

    for (var i = 0; i < arrayData.length; i++) {
        var item = arrayData[i];
        var grade = tentukanGrade(item.nilai);
        var bobot = bobotNilai[grade] !== undefined ? bobotNilai[grade] : 0;

        totalSks += item.sks;
        totalBobotSks += (bobot * item.sks);
    }

    if (totalSks === 0) return '0.00';
    return (totalBobotSks / totalSks).toFixed(2);
}




var elemenFormInputNilai = document.getElementById('formInputNilai');

if (elemenFormInputNilai !== null) {

    function perbaruiTampilan(kataCari = '') {
        var data = ambilDataNilai();
        var badgeJml = document.getElementById('badgeJumlahData');
        var badgeIpkEl = document.getElementById('badgeIpk');
        var tombolHapusSemua = document.getElementById('tombolHapusSemua');

        if (data.length === 0) {
            document.getElementById('pesanTabelKosong').classList.remove('d-none');
            document.getElementById('areaTabelInput').classList.add('d-none');
            if (tombolHapusSemua) tombolHapusSemua.classList.add('d-none');
            badgeJml.innerHTML = '0 MK';
            badgeIpkEl.innerHTML = '-';
        } else {
            document.getElementById('pesanTabelKosong').classList.add('d-none');
            document.getElementById('areaTabelInput').classList.remove('d-none');
            if (tombolHapusSemua) tombolHapusSemua.classList.remove('d-none');

            badgeJml.innerHTML = data.length + ' MK';
            badgeIpkEl.innerHTML = hitungIpk(data);

            var baris = '';
            var nomorUrut = 1;

            for (var i = 0; i < data.length; i++) {
                var mk = data[i];

                var namaMkLower = mk.namaMk.toLowerCase();
                var kataCariLower = kataCari.toLowerCase();

                if (namaMkLower.indexOf(kataCariLower) === -1) {
                    continue;
                }

                var grade = tentukanGrade(mk.nilai);
                var warnaBadge = warnaBadgeGrade(grade);
                var statusLulusHtml = tentukanStatusLulus(grade);

                var classWarnaBaris = '';
                if (grade === 'A') classWarnaBaris = 'baris-grade-a';
                else if (grade === 'E') classWarnaBaris = 'baris-grade-e';

                baris += '<tr class="' + classWarnaBaris + '">';
                baris += '<td>' + nomorUrut + '</td>';
                baris += '<td class="fw-semibold">' + mk.namaMk + '</td>';
                baris += '<td class="text-center">' + mk.sks + '</td>';
                baris += '<td class="text-center fw-bold">' + mk.nilai + '</td>';
                baris += '<td class="text-center"><span class="badge ' + warnaBadge + ' px-3">' + grade + '</span></td>';
                baris += '<td class="text-center">' + statusLulusHtml + '</td>';
                baris += '<td class="text-center">Sem ' + mk.semester + '</td>';
                // SUDAH DIPERBAIKI: Mengembalikan teks tombol menjadi ikon tempat sampah murni 🗑️
                baris += '<td class="text-center"><button class="btn btn-outline-danger btn-sm" onclick="hapusSatuNilai(' + i + ')">🗑️</button></td>';
                baris += '</tr>';

                nomorUrut++;
            }

            if (baris === '') {
                document.getElementById('tabelInputNilai').innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Mata kuliah tidak ditemukan.</td></tr>';
            } else {
                document.getElementById('tabelInputNilai').innerHTML = baris;
            }
        }
    }

    var inputCariMk = document.getElementById('inputCariMk');
    if (inputCariMk !== null) {
        inputCariMk.addEventListener('input', function() {
            var kataKunci = this.value;
            perbaruiTampilan(kataKunci);
        });
    }

    function tampilkanAlert(tipe, pesan) {
        var areaAlert = document.getElementById('areaAlert');
        areaAlert.className = 'alert alert-' + tipe + ' mb-3';
        areaAlert.innerHTML = pesan;
        setTimeout(function() {
            areaAlert.className = 'alert d-none mb-3';
        }, 3000);
    }

    document.getElementById('inputNilaiAngka').addEventListener('input', function() {
        var nilaiDiketik = parseInt(this.value);
        var divPreview = document.getElementById('previewGrade');

        if (isNaN(nilaiDiketik) || nilaiDiketik < 0 || nilaiDiketik > 100) {
            divPreview.classList.add('d-none');
            return;
        }

        var gradePreview = tentukanGrade(nilaiDiketik);
        divPreview.classList.remove('d-none');
        divPreview.innerHTML = 'Grade sementara: <strong class="ms-1">' + gradePreview + '</strong>';
    });

    elemenFormInputNilai.addEventListener('submit', function(event) {
        event.preventDefault();
        var semuaInput = document.querySelectorAll('.form-control, .form-select');
        for (var k = 0; k < semuaInput.length; k++) {
            semuaInput[k].classList.remove('is-invalid');
        }

        var namaMk   = document.getElementById('inputNamaMk').value.trim();
        var sks      = document.getElementById('inputSks').value;
        var nilaiStr = document.getElementById('inputNilaiAngka').value;
        var semester = document.getElementById('inputSemester').value;
        var adaError = false;

        if (namaMk === '') { document.getElementById('inputNamaMk').classList.add('is-invalid'); adaError = true; }
        if (sks === '') { document.getElementById('inputSks').classList.add('is-invalid'); adaError = true; }
        
        var nilaiAngka = parseInt(nilaiStr);
        if (nilaiStr === '' || isNaN(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
            document.getElementById('inputNilaiAngka').classList.add('is-invalid');
            adaError = true;
        }
        if (semester === '') { document.getElementById('inputSemester').classList.add('is-invalid'); adaError = true; }

        if (adaError) return;

        var dataNilaiBaru = {
            namaMk: namaMk,
            sks: parseInt(sks),
            nilai: nilaiAngka,
            semester: parseInt(semester)
        };

        var semuaData = ambilDataNilai();
        semuaData.push(dataNilaiBaru);
        simpanDataNilai(semuaData);

        perbaruiTampilan();
        var gradeYangDisimpan = tentukanGrade(nilaiAngka);
        tampilkanAlert('success', '✅ Nilai <strong>' + namaMk + '</strong> berhasil disimpan. Grade: <strong>' + gradeYangDisimpan + '</strong>');

        elemenFormInputNilai.reset();
        document.getElementById('previewGrade').classList.add('d-none');
        if(inputCariMk) inputCariMk.value = '';
    });

    function hapusSatuNilai(indeks) {
        var semuaData = ambilDataNilai();
        var namaYangDihapus = semuaData[indeks].namaMk;
        semuaData.splice(indeks, 1);
        simpanDataNilai(semuaData);
        perbaruiTampilan();
        tampilkanAlert('warning', '🗑️ Nilai <strong>' + namaYangDihapus + '</strong> telah dihapus.');
        if(inputCariMk) inputCariMk.value = '';
    }
    window.hapusSatuNilai = hapusSatuNilai;

    var tombolHapusSemuaElement = document.getElementById('tombolHapusSemua');
    if (tombolHapusSemuaElement) {
        tombolHapusSemuaElement.addEventListener('click', function() {
            var yakin = confirm('Apakah Anda yakin ingin menghapus SEMUA data nilai?\nTindakan ini tidak bisa dibatalkan.');
            if (yakin === true) {
                localStorage.removeItem('dataNilai');
                perbaruiTampilan();
                tampilkanAlert('danger', '🗑️ Semua data nilai telah dihapus.');
                if(inputCariMk) inputCariMk.value = '';
            }
        });
    }

    perbaruiTampilan();
}



var elemenAreaTabs = document.getElementById('areaTabs');

if (elemenAreaTabs !== null) {
    var semuaDataRekap = ambilDataNilai();

    if (semuaDataRekap.length === 0) {
        document.getElementById('pesanRekapKosong').classList.remove('d-none');
    } else {
        document.getElementById('areaTabs').classList.remove('d-none');

        var kelompokPerSemester = {};
        for (var i = 0; i < semuaDataRekap.length; i++) {
            var mk = semuaDataRekap[i];
            var kunciSem = 'sem' + mk.semester;

            if (kelompokPerSemester[kunciSem] === undefined) {
                kelompokPerSemester[kunciSem] = [];
            }
            kelompokPerSemester[kunciSem].push(mk);
        }

        var daftarKunciSem = Object.keys(kelompokPerSemester);
        daftarKunciSem.sort();

        var htmlTombolTab = '';
        var htmlKontenTab = '';

        for (var j = 0; j < daftarKunciSem.length; j++) {
            var kunci = daftarKunciSem[j];
            var mkDiSemIni = kelompokPerSemester[kunci];
            var nomorSemester = kunci.replace('sem', '');
            var idTab = 'tab-' + kunci;
            var apakahAktif = (j === 0);

            htmlTombolTab += '<li class="nav-item" role="presentation">';
            htmlTombolTab += '<button class="nav-link' + (apakahAktif ? ' active' : '') + '"';
            htmlTombolTab += ' id="btn-' + idTab + '" data-bs-toggle="tab" data-bs-target="#' + idTab + '"';
            htmlTombolTab += ' type="button" role="tab" aria-controls="' + idTab + '" aria-selected="' + apakahAktif + '">';
            htmlTombolTab += 'Semester ' + nomorSemester;
            htmlTombolTab += ' <span class="badge bg-secondary ms-1">' + mkDiSemIni.length + '</span>';
            htmlTombolTab += '</button></li>';

            var ipkSemIni = hitungIpk(mkDiSemIni);
            var totalSksSemIni = 0;
            for (var m = 0; m < mkDiSemIni.length; m++) {
                totalSksSemIni += mkDiSemIni[m].sks;
            }

            htmlKontenTab += '<div class="tab-pane fade' + (apakahAktif ? ' show active' : '') + '" id="' + idTab + '" role="tabpanel">';
            htmlKontenTab += '<div class="d-flex gap-3 mb-3 flex-wrap">';
            htmlKontenTab += '<span class="badge bg-dark p-2">📄 ' + mkDiSemIni.length + ' Mata Kuliah</span>';
            htmlKontenTab += '<span class="badge bg-dark p-2">📝 Total SKS: ' + totalSksSemIni + '</span>';
            htmlKontenTab += '<span class="badge bg-dark p-2">🎯 IPS: ' + ipkSemIni + '</span>';
            htmlKontenTab += '</div>';

            htmlKontenTab += '<div class="table-responsive">';
            htmlKontenTab += '<table class="table table-hover table-sm mb-0">';
            htmlKontenTab += '<thead class="table-secondary">';
            htmlKontenTab += '<tr><th>No</th><th>Mata Kuliah</th><th class="text-center">SKS</th><th class="text-center">Nilai</th><th class="text-center">Grade</th><th class="text-center">Status</th></tr>';
            htmlKontenTab += '</thead><tbody>';

            for (var n = 0; n < mkDiSemIni.length; n++) {
                var mkItem = mkDiSemIni[n];
                var gradeItem = tentukanGrade(mkItem.nilai);
                var warnaBadgeItem = warnaBadgeGrade(gradeItem);
                var statusLulusRekapHtml = tentukanStatusLulus(gradeItem);

                htmlKontenTab += '<tr>';
                htmlKontenTab += '<td>' + (n + 1) + '</td>';
                htmlKontenTab += '<td>' + mkItem.namaMk + '</td>';
                htmlKontenTab += '<td class="text-center">' + mkItem.sks + '</td>';
                htmlKontenTab += '<td class="text-center fw-bold">' + mkItem.nilai + '</td>';
                htmlKontenTab += '<td class="text-center"><span class="badge ' + warnaBadgeItem + '">' + gradeItem + '</span></td>';
                htmlKontenTab += '<td class="text-center">' + statusLulusRekapHtml + '</td>';
                htmlKontenTab += '</tr>';
            }

            htmlKontenTab += '</tbody></table></div>';
            htmlKontenTab += '</div>';
        }

        document.getElementById('tabSemester').innerHTML = htmlTombolTab;
        document.getElementById('kontenTab').innerHTML = htmlKontenTab;
    }
}



var elemenStatIpk = document.getElementById('statIpk');

if (elemenStatIpk !== null) {
    
    var dataDashboard = ambilDataNilai();
    var ipkSekarangStr = hitungIpk(dataDashboard);

    var statJumlahMk = document.getElementById('statJumlahMk');
    var statTertinggi = document.getElementById('statTertinggi');
    var statTerendah = document.getElementById('statTerendah');
    var pesanBelumAdaData = document.getElementById('pesanBelumAdaData');
    var areaTabelDashboard = document.getElementById('areaTabelDashboard');
    var tabelDashboard = document.getElementById('tabelDashboard');

    // Buat atau cari elemen div untuk pesanIpk (Tantangan 3)
    var elemenPesanIpk = document.getElementById('pesanIpk');
    if (!elemenPesanIpk) {
        elemenPesanIpk = document.createElement('div');
        elemenPesanIpk.id = 'pesanIpk';
        elemenPesanIpk.className = 'mt-3 mx-3'; 
        
        // Sisipkan alert tepat di dalam card-body p-0, di atas pesan / tabel
        var cardBodyDashboard = document.querySelector('.card-body');
        if (cardBodyDashboard) {
            cardBodyDashboard.insertBefore(elemenPesanIpk, cardBodyDashboard.firstChild);
        }
    }

    // 1. JIKA ADA DATA NILAI
    if (dataDashboard.length > 0) {
        
        // Kalkulasi Nilai Tertinggi & Terendah
        var nilaiTertinggi = 0;
        var nilaiTerendah = 100;
        for (var g = 0; g < dataDashboard.length; g++) {
            if (dataDashboard[g].nilai > nilaiTertinggi) nilaiTertinggi = dataDashboard[g].nilai;
            if (dataDashboard[g].nilai < nilaiTerendah)  nilaiTerendah = dataDashboard[g].nilai;
        }

        // Tembak angka hasil kalkulasi ke kartu statistik atas
        elemenStatIpk.innerHTML = ipkSekarangStr;
        if (statJumlahMk) statJumlahMk.innerHTML = dataDashboard.length;
        if (statTertinggi) statTertinggi.innerHTML = nilaiTertinggi;
        if (statTerendah) statTerendah.innerHTML = nilaiTerendah;

        // Sembunyikan tulisan "Belum ada data nilai" dan munculkan area tabel ringkasan
        if (pesanBelumAdaData) pesanBelumAdaData.classList.add('d-none');
        if (areaTabelDashboard) areaTabelDashboard.classList.remove('d-none');

        // Bikin baris data untuk tabel ringkasan dashboard
        var barisDashboard = '';
        for (var d = 0; d < dataDashboard.length; d++) {
            var mkDash = dataDashboard[d];
            var gradeDash = tentukanGrade(mkDash.nilai);

            barisDashboard += '<tr>';
            barisDashboard += '<td>' + (d + 1) + '</td>';
            barisDashboard += '<td class="fw-semibold">' + mkDash.namaMk + '</td>';
            barisDashboard += '<td>' + mkDash.sks + '</td>';
            barisDashboard += '<td class="fw-bold">' + mkDash.nilai + '</td>';
            barisDashboard += '<td>' + gradeDash + '</td>';
            barisDashboard += '<td>Sem ' + mkDash.semester + '</td>';
            barisDashboard += '</tr>';
        }
        if (tabelDashboard) tabelDashboard.innerHTML = barisDashboard;

        // Jalankan aturan alert Tantangan 3
        var ipkSekarang = parseFloat(ipkSekarangStr);
        if (ipkSekarang < 2.50) {
            elemenPesanIpk.className = 'alert alert-warning mx-3 mt-3';
            elemenPesanIpk.innerHTML = '⚠️ <strong>Peringatan!</strong> Nilai IPK Anda saat ini adalah <strong>' + ipkSekarangStr + '</strong> (di bawah 2.50). Silakan tingkatkan performa akademis Anda di semester berikutnya!';
        } else {
            elemenPesanIpk.className = 'alert alert-success mx-3 mt-3';
            elemenPesanIpk.innerHTML = '🎉 <strong>Selamat!</strong> Nilai IPK Anda saat ini sangat baik, yaitu <strong>' + ipkSekarangStr + '</strong>. Pertahankan terus prestasi belajar Anda!';
        }

    } else {
        // 2. JIKA DATA BENERAN KOSONG
        elemenStatIpk.innerHTML = '—';
        if (statJumlahMk) statJumlahMk.innerHTML = '—';
        if (statTertinggi) statTertinggi.innerHTML = '—';
        if (statTerendah) statTerendah.innerHTML = '—';
        
        if (pesanBelumAdaData) pesanBelumAdaData.classList.remove('d-none');
        if (areaTabelDashboard) areaTabelDashboard.classList.add('d-none');

        elemenPesanIpk.className = 'alert alert-info mx-3 mt-3';
        elemenPesanIpk.innerHTML = 'ℹ️ Belum ada data nilai. Silakan masukkan nilai terlebih dahulu di halaman <strong>Input Nilai</strong>.';
    }
}
