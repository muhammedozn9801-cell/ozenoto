// ÖZEN OTO - AKILLI SEPET VE WHATSAPP SİPARİŞ SİSTEMİ

let sepet = JSON.parse(localStorage.getItem('ozen_sepet')) || [];

// SEPETE ÜRÜN EKLE
function sepeteEkle(urunId) {
    const tumUrunler = window.urunler || [];
    const urun = tumUrunler.find(u => u.id === urunId);
    if (!urun) return;

    const varOlan = sepet.find(item => item.id === urunId);
    if (varOlan) {
        varOlan.adet += 1;
    } else {
        sepet.push({
            id: urun.id,
            baslik: urun.baslik,
            oem: urun.oem,
            arac: urun.arac,
            resim: urun.resim,
            adet: 1
        });
    }

    sepetiKaydet();
    sepetArayuzunuGuncelle();
    sepetToastGoster(`${urun.baslik.substring(0, 25)}... sepete eklendi!`);
}

// ADET DEĞİŞTİR ( + / - )
function sepetAdetDegistir(urunId, degisim) {
    const item = sepet.find(i => i.id === urunId);
    if (!item) return;

    item.adet += degisim;
    if (item.adet <= 0) {
        sepettenCikar(urunId);
    } else {
        sepetiKaydet();
        sepetArayuzunuGuncelle();
    }
}

// SEPETTEN ÇIKAR
function sepettenCikar(urunId) {
    sepet = sepet.filter(i => i.id !== urunId);
    sepetiKaydet();
    sepetArayuzunuGuncelle();
}

function sepetiKaydet() {
    localStorage.setItem('ozen_sepet', JSON.stringify(sepet));
}

// SEPET SAYACI VE MOBİL BARI GÜNCELLE
function sepetArayuzunuGuncelle() {
    const toplamAdet = sepet.reduce((toplam, item) => toplam + item.adet, 0);
    
    // Header Sayaç
    const headerSayac = document.getElementById('sepet-sayac');
    if (headerSayac) {
        headerSayac.textContent = toplamAdet;
        headerSayac.style.display = toplamAdet > 0 ? 'flex' : 'none';
    }

    // Mobil Yüzen Bar
    const mobilBar = document.getElementById('mobil-sepet-bar');
    if (mobilBar) {
        if (toplamAdet > 0) {
            mobilBar.classList.remove('translate-y-full');
            document.getElementById('mobil-sepet-adet').textContent = `${toplamAdet} Parça`;
        } else {
            mobilBar.classList.add('translate-y-full');
        }
    }

    // Sepet Modalı İçeriği
    const sepetListe = document.getElementById('sepet-modal-liste');
    if (sepetListe) {
        if (sepet.length === 0) {
            sepetListe.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-cart-flatbed text-5xl mb-3 text-gray-300 dark:text-gray-700"></i>
                    <p class="font-bold text-sm">Sepetiniz şu an boş.</p>
                    <p class="text-xs text-gray-500 mt-1">İhtiyacınız olan parçaları "Sepete Ekle" butonuyla ekleyebilirsiniz.</p>
                </div>`;
        } else {
            sepetListe.innerHTML = sepet.map(item => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 gap-3">
                    <div class="flex-1 min-w-0">
                        <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${item.baslik}</h5>
                        <p class="text-[10px] text-gray-500 font-mono">OEM: ${item.oem} | ${item.arac}</p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="sepetAdetDegistir('${item.id}', -1)" class="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white transition-colors">-</button>
                        <span class="text-xs font-black w-5 text-center">${item.adet}</span>
                        <button onclick="sepetAdetDegistir('${item.id}', 1)" class="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-green-500 hover:text-white transition-colors">+</button>
                        <button onclick="sepettenCikar('${item.id}')" class="text-red-500 hover:text-red-700 ml-1 text-xs p-1"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// WHATSAPP SİPARİŞİ OLUŞTUR VE GÖNDER
function whatsappSiparisGonder() {
    if (sepet.length === 0) {
        alert("Sepetinizde ürün bulunmamaktadır.");
        return;
    }

    // Profilde kayıtlı müşteri bilgisi var mı kontrol et
    const kullanici = JSON.parse(localStorage.getItem('ozen_kullanici')) || {};

    let mesaj = `🛒 *ÖZEN OTO - SİPARİŞ / FİYAT TEKLİFİ TALEBİ*\n\n`;

    if (kullanici.adSoyad) {
        mesaj += `👤 *Müşteri:* ${kullanici.adSoyad}\n`;
        if (kullanici.telefon) mesaj += `📞 *Tel:* ${kullanici.telefon}\n`;
        if (kullanici.sasi) mesaj += `🚘 *Şasi No (VIN):* ${kullanici.sasi}\n`;
        if (kullanici.adres) mesaj += `📍 *Adres:* ${kullanici.adres}\n`;
        mesaj += `-----------------------------------\n`;
    }

    mesaj += `📦 *TALEP EDİLEN PARÇALAR:*\n`;
    sepet.forEach((item, index) => {
        mesaj += `${index + 1}. *${item.baslik}*\n   └ OEM: ${item.oem} | Adet: ${item.adet}\n`;
    });

    mesaj += `\nBu parçaların stok durumu ve toplam fiyatı hakkında bilgi alabilir miyim?`;

    const encodedMsg = encodeURIComponent(mesaj);
    window.open(`https://wa.me/905327249417?text=${encodedMsg}`, '_blank');
}

function sepetToastGoster(mesaj) {
    if (typeof toastGoster === 'function') {
        toastGoster(mesaj);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    sepetArayuzunuGuncelle();
});
