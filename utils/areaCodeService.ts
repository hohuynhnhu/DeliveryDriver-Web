// services/areaCodeService.ts
import type { GeoPoint } from '@/@type/order'

interface AddressComponents {
  district?: string // Quận/Huyện/TP
  ward?: string // Phường/Xã
  city?: string // Thành phố
}

/**
 * Parse địa chỉ từ Google Maps API response
 * @param addressComponents - Array address components từ Google Maps
 */
export function parseAddressComponents(addressComponents: any[]): AddressComponents {
  const result: AddressComponents = {}

  for (const component of addressComponents) {
    const types = component.types

    // Phường/Xã
    if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
      result.ward = component.long_name
    }

    // Quận/Huyện
    if (types.includes('administrative_area_level_2')) {
      result.district = component.long_name
    }
    
    // Thành phố
    if (types.includes('administrative_area_level_1')) {
      result.city = component.long_name
    }
  }

  return result
}

/**
 * Mapping area code cho TP.HCM (Cập nhật 01/07/2025)
 * TP.HCM có 22 đơn vị hành chính: 16 Quận + 1 TP Thủ Đức + 5 Huyện
 */
const DISTRICT_AREA_CODE_MAP: Record<string, string> = {
  // ============================================
  // 16 QUẬN NỘI THÀNH
  // ============================================
  
  // Quận 1
  'Quận 1': 'Q01',
  'Quan 1': 'Q01',
  'District 1': 'Q01',
  
  // Quận 3
  'Quận 3': 'Q03',
  'Quan 3': 'Q03',
  'District 3': 'Q03',
  
  // Quận 4
  'Quận 4': 'Q04',
  'Quan 4': 'Q04',
  'District 4': 'Q04',
  
  // Quận 5
  'Quận 5': 'Q05',
  'Quan 5': 'Q05',
  'District 5': 'Q05',
  
  // Quận 6
  'Quận 6': 'Q06',
  'Quan 6': 'Q06',
  'District 6': 'Q06',
  
  // Quận 7
  'Quận 7': 'Q07',
  'Quan 7': 'Q07',
  'District 7': 'Q07',
  
  // Quận 8
  'Quận 8': 'Q08',
  'Quan 8': 'Q08',
  'District 8': 'Q08',
  
  // Quận 10
  'Quận 10': 'Q10',
  'Quan 10': 'Q10',
  'District 10': 'Q10',
  
  // Quận 11
  'Quận 11': 'Q11',
  'Quan 11': 'Q11',
  'District 11': 'Q11',
  
  // Quận 12
  'Quận 12': 'Q12',
  'Quan 12': 'Q12',
  'District 12': 'Q12',
  
  // Quận Bình Thạnh
  'Quận Bình Thạnh': 'QBT',
  'Bình Thạnh': 'QBT',
  'Binh Thanh': 'QBT',
  'District Binh Thanh': 'QBT',
  
  // Quận Gò Vấp
  'Quận Gò Vấp': 'QGV',
  'Gò Vấp': 'QGV',
  'Go Vap': 'QGV',
  'District Go Vap': 'QGV',
  
  // Quận Phú Nhuận
  'Quận Phú Nhuận': 'QPN',
  'Phú Nhuận': 'QPN',
  'Phu Nhuan': 'QPN',
  'District Phu Nhuan': 'QPN',
  
  // Quận Tân Bình
  'Quận Tân Bình': 'QTB',
  'Tân Bình': 'QTB',
  'Tan Binh': 'QTB',
  'District Tan Binh': 'QTB',
  
  // Quận Tân Phú
  'Quận Tân Phú': 'QTP',
  'Tân Phú': 'QTP',
  'Tan Phu': 'QTP',
  'District Tan Phu': 'QTP',
  
  // Quận Bình Tân
  'Quận Bình Tân': 'QBN',
  'Bình Tân': 'QBN',
  'Binh Tan': 'QBN',
  'District Binh Tan': 'QBN',

  // ============================================
  // 1 THÀNH PHỐ TRỰC THUỘC
  // ============================================
  
  // Thành phố Thủ Đức (Sáp nhập Q2, Q9, Thủ Đức cũ từ 01/01/2021)
  'Thành phố Thủ Đức': 'TD',
  'Thanh pho Thu Duc': 'TD',
  'TP Thủ Đức': 'TD',
  'TP Thu Duc': 'TD',
  'Thủ Đức': 'TD',
  'Thu Duc': 'TD',
  'Thu Duc City': 'TD',
  
  // Tên cũ (trước 01/01/2021) - vẫn map về TD
  'Quận 2': 'TD',
  'Quan 2': 'TD',
  'District 2': 'TD',
  'Quận 9': 'TD',
  'Quan 9': 'TD',
  'District 9': 'TD',
  'Quận Thủ Đức': 'TD',

  // ============================================
  // 5 HUYỆN NGOẠI THÀNH
  // ============================================
  
  // Huyện Củ Chi
  'Huyện Củ Chi': 'HCC',
  'Củ Chi': 'HCC',
  'Cu Chi': 'HCC',
  
  // Huyện Hóc Môn
  'Huyện Hóc Môn': 'HHM',
  'Hóc Môn': 'HHM',
  'Hoc Mon': 'HHM',
  
  // Huyện Bình Chánh
  'Huyện Bình Chánh': 'HBC',
  'Bình Chánh': 'HBC',
  'Binh Chanh': 'HBC',
  
  // Huyện Nhà Bè
  'Huyện Nhà Bè': 'HNB',
  'Nhà Bè': 'HNB',
  'Nha Be': 'HNB',
  
  // Huyện Cần Giờ
  'Huyện Cần Giờ': 'HCG',
  'Cần Giờ': 'HCG',
  'Can Gio': 'HCG',
}

/**
 * Mapping phường/xã chi tiết cho từng quận/huyện
 * Format: DISTRICT_CODE-WARD_CODE
 */
const WARD_AREA_CODE_MAP: Record<string, string> = {
  // ============================================
  // QUẬN 1 - 10 Phường
  // ============================================
  'Phường Bến Nghé': 'Q01-BN',
  'Phường Bến Thành': 'Q01-BT',
  'Phường Cầu Kho': 'Q01-CK',
  'Phường Cầu Ông Lãnh': 'Q01-COL',
  'Phường Cô Giang': 'Q01-CG',
  'Phường Đa Kao': 'Q01-DK',
  'Phường Nguyễn Cư Trinh': 'Q01-NCT',
  'Phường Nguyễn Thái Bình': 'Q01-NTB',
  'Phường Phạm Ngũ Lão': 'Q01-PNL',
  'Phường Tân Định': 'Q01-TD',

  // ============================================
  // QUẬN 3 - 14 Phường
  // ============================================
  'Phường 01': 'Q03-01',
  'Phường 02': 'Q03-02',
  'Phường 03': 'Q03-03',
  'Phường 04': 'Q03-04',
  'Phường 05': 'Q03-05',
  'Phường 06': 'Q03-06',
  'Phường 07': 'Q03-07',
  'Phường 08': 'Q03-08',
  'Phường 09': 'Q03-09',
  'Phường 10': 'Q03-10',
  'Phường 11': 'Q03-11',
  'Phường 12': 'Q03-12',
  'Phường 13': 'Q03-13',
  'Phường 14': 'Q03-14',

  // ============================================
  // QUẬN 4 - 18 Phường
  // ============================================
  'Phường 1': 'Q04-01',
  'Phường 2': 'Q04-02',
  'Phường 3': 'Q04-03',
  'Phường 4': 'Q04-04',
  'Phường 5': 'Q04-05',
  'Phường 6': 'Q04-06',
  'Phường 8': 'Q04-08',
  'Phường 9': 'Q04-09',
  'Phường 10 ': 'Q04-10',
  'Phường 13 ': 'Q04-13',
  'Phường 14 ': 'Q04-14',
  'Phường 15': 'Q04-15',
  'Phường 16': 'Q04-16',
  'Phường 18': 'Q04-18',

  // ============================================
  // QUẬN 5 - 15 Phường
  // ============================================
  // (Thêm 15 phường của Quận 5...)

  // ============================================
  // QUẬN 6 - 14 Phường
  // ============================================
  // (Thêm 14 phường của Quận 6...)

  // ============================================
  // QUẬN 7 - 10 Phường
  // ============================================
  'Phường Bình Thuận': 'Q07-BTN',
  'Phường Phú Mỹ': 'Q07-PM',
  'Phường Phú Thuận': 'Q07-PT',
  'Phường Tân Hưng': 'Q07-TH',
  'Phường Tân Kiểng': 'Q07-TK',
  'Phường Tân Phong': 'Q07-TP',
  'Phường Tân Phú (Quận 7)': 'Q07-TPU',
  'Phường Tân Quy': 'Q07-TQ',
  'Phường Tân Thuận Đông': 'Q07-TTD',
  'Phường Tân Thuận Tây': 'Q07-TTT',

  // ============================================
  // QUẬN 8 - 16 Phường
  // ============================================
  // (Thêm 16 phường của Quận 8...)

  // ============================================
  // QUẬN 10 - 15 Phường
  // ============================================
  // (Thêm 15 phường của Quận 10...)

  // ============================================
  // QUẬN 11 - 16 Phường
  // ============================================
  // (Thêm 16 phường của Quận 11...)

  // ============================================
  // QUẬN 12 - 11 Phường
  // ============================================
  'Phường An Phú Đông': 'Q12-APD',
  'Phường Đông Hưng Thuận': 'Q12-DHT',
  'Phường Hiệp Thành': 'Q12-HT',
  'Phường Tân Chánh Hiệp': 'Q12-TCH',
  'Phường Tân Hưng Thuận': 'Q12-THT',
  'Phường Tân Thới Hiệp': 'Q12-TTH',
  'Phường Tân Thới Nhất': 'Q12-TTN',
  'Phường Thạnh Lộc': 'Q12-TL',
  'Phường Thạnh Xuân': 'Q12-TX',
  'Phường Thới An': 'Q12-TA',
  'Phường Trung Mỹ Tây': 'Q12-TMT',

  // ============================================
  // QUẬN BÌNH THẠNH - 20 Phường
  // ============================================
  'Phường 01 (Bình Thạnh)': 'QBT-01',
  'Phường 02 (Bình Thạnh)': 'QBT-02',
  'Phường 03 (Bình Thạnh)': 'QBT-03',
  'Phường 05 (Bình Thạnh)': 'QBT-05',
  'Phường 06 (Bình Thạnh)': 'QBT-06',
  'Phường 07 (Bình Thạnh)': 'QBT-07',
  'Phường 11 (Bình Thạnh)': 'QBT-11',
  'Phường 12 (Bình Thạnh)': 'QBT-12',
  'Phường 13 (Bình Thạnh)': 'QBT-13',
  'Phường 14 (Bình Thạnh)': 'QBT-14',
  'Phường 15 (Bình Thạnh)': 'QBT-15',
  'Phường 17 (Bình Thạnh)': 'QBT-17',
  'Phường 19 (Bình Thạnh)': 'QBT-19',
  'Phường 21 (Bình Thạnh)': 'QBT-21',
  'Phường 22 (Bình Thạnh)': 'QBT-22',
  'Phường 24 (Bình Thạnh)': 'QBT-24',
  'Phường 25 (Bình Thạnh)': 'QBT-25',
  'Phường 26 (Bình Thạnh)': 'QBT-26',
  'Phường 27 (Bình Thạnh)': 'QBT-27',
  'Phường 28 (Bình Thạnh)': 'QBT-28',

  // ============================================
  // QUẬN GÒ VẤP - 16 Phường
  // ============================================
  'Phường 01 (Gò Vấp)': 'QGV-01',
  'Phường 03 (Gò Vấp)': 'QGV-03',
  'Phường 04 (Gò Vấp)': 'QGV-04',
  'Phường 05 (Gò Vấp)': 'QGV-05',
  'Phường 06 (Gò Vấp)': 'QGV-06',
  'Phường 07 (Gò Vấp)': 'QGV-07',
  'Phường 08 (Gò Vấp)': 'QGV-08',
  'Phường 09 (Gò Vấp)': 'QGV-09',
  'Phường 10 (Gò Vấp)': 'QGV-10',
  'Phường 11 (Gò Vấp)': 'QGV-11',
  'Phường 12 (Gò Vấp)': 'QGV-12',
  'Phường 13 (Gò Vấp)': 'QGV-13',
  'Phường 14 (Gò Vấp)': 'QGV-14',
  'Phường 15 (Gò Vấp)': 'QGV-15',
  'Phường 16 (Gò Vấp)': 'QGV-16',
  'Phường 17 (Gò Vấp)': 'QGV-17',

  // ============================================
  // QUẬN PHÚ NHUẬN - 15 Phường
  // ============================================
  'Phường 01 (Phú Nhuận)': 'QPN-01',
  'Phường 02 (Phú Nhuận)': 'QPN-02',
  'Phường 03 (Phú Nhuận)': 'QPN-03',
  'Phường 04 (Phú Nhuận)': 'QPN-04',
  'Phường 05 (Phú Nhuận)': 'QPN-05',
  'Phường 07 (Phú Nhuận)': 'QPN-07',
  'Phường 08 (Phú Nhuận)': 'QPN-08',
  'Phường 09 (Phú Nhuận)': 'QPN-09',
  'Phường 10 (Phú Nhuận)': 'QPN-10',
  'Phường 11 (Phú Nhuận)': 'QPN-11',
  'Phường 12 (Phú Nhuận)': 'QPN-12',
  'Phường 13 (Phú Nhuận)': 'QPN-13',
  'Phường 15 (Phú Nhuận)': 'QPN-15',
  'Phường 17 (Phú Nhuận)': 'QPN-17',
  'Phường Phú Trung': 'QPN-PT',

  // ============================================
  // QUẬN TÂN BÌNH - 15 Phường
  // ============================================
  'Phường 01 (Tân Bình)': 'QTB-01',
  'Phường 02 (Tân Bình)': 'QTB-02',
  'Phường 03 (Tân Bình)': 'QTB-03',
  'Phường 04 (Tân Bình)': 'QTB-04',
  'Phường 05 (Tân Bình)': 'QTB-05',
  'Phường 06 (Tân Bình)': 'QTB-06',
  'Phường 07 (Tân Bình)': 'QTB-07',
  'Phường 08 (Tân Bình)': 'QTB-08',
  'Phường 09 (Tân Bình)': 'QTB-09',
  'Phường 10 (Tân Bình)': 'QTB-10',
  'Phường 11 (Tân Bình)': 'QTB-11',
  'Phường 12 (Tân Bình)': 'QTB-12',
  'Phường 13 (Tân Bình)': 'QTB-13',
  'Phường 14 (Tân Bình)': 'QTB-14',
  'Phường 15 (Tân Bình)': 'QTB-15',

  // ============================================
  // QUẬN TÂN PHÚ - 11 Phường
  // ============================================
  'Phường Hiệp Tân': 'QTP-HT',
  'Phường Hòa Thạnh': 'QTP-HTH',
  'Phường Phú Thạnh': 'QTP-PT',
  'Phường Phú Thọ Hòa': 'QTP-PTH',
  'Phường Phú Trung (Quận Tân Phú)': 'QTP-PTR',
  'Phường Sơn Kỳ': 'QTP-SK',
  'Phường Tân Quý': 'QTP-TQ',
  'Phường Tân Sơn Nhì': 'QTP-TSN',
  'Phường Tân Thành': 'QTP-TT',
  'Phường Tân Thới Hòa': 'QTP-TTH',
  'Phường Tây Thạnh': 'QTP-TTN',

  // ============================================
  // QUẬN BÌNH TÂN - 10 Phường
  // ============================================
  'Phường An Lạc': 'QBN-AL',
  'Phường An Lạc A': 'QBN-ALA',
  'Phường Bình Hưng Hòa': 'QBN-BHH',
  'Phường Bình Hưng Hòa A': 'QBN-BHHA',
  'Phường Bình Hưng Hòa B': 'QBN-BHHB',
  'Phường Bình Trị Đông': 'QBN-BTD',
  'Phường Bình Trị Đông A': 'QBN-BTDA',
  'Phường Bình Trị Đông B': 'QBN-BTDB',
  'Phường Tân Tạo': 'QBN-TT',
  'Phường Tân Tạo A': 'QBN-TTA',

  // ============================================
  // THÀNH PHỐ THỦ ĐỨC - 22 Phường
  // ============================================
  
  // Khu vực cũ Quận 2
  'Phường An Khánh': 'TD-AK',
  'Phường An Lợi Đông': 'TD-ALD',
  'Phường An Phú': 'TD-AP',
  'Phường Bình An': 'TD-BA',
  'Phường Bình Khánh': 'TD-BK',
  'Phường Bình Trưng Đông': 'TD-BTD',
  'Phường Bình Trưng Tây': 'TD-BTT',
  'Phường Cát Lái': 'TD-CL',
  'Phường Thảo Điền': 'TD-TDN',
  'Phường Thạnh Mỹ Lợi': 'TD-TML',
  'Phường Thủ Thiêm': 'TD-TTM',

  // Khu vực cũ Quận 9
  'Phường Hiệp Phú': 'TD-HP',
  'Phường Long Bình': 'TD-LB',
  'Phường Long Phước': 'TD-LP',
  'Phường Long Thạnh Mỹ': 'TD-LTM',
  'Phường Long Trường': 'TD-LTR',
  'Phường Phú Hữu': 'TD-PH',
  'Phường Phước Bình': 'TD-PB',
  'Phường Phước Long A': 'TD-PLA',
  'Phường Phước Long B': 'TD-PLB',
  'Phường Tăng Nhơn Phú A': 'TD-TNPA',
  'Phường Tăng Nhơn Phú B': 'TD-TNPB',
  'Phường Tân Phú': 'TD-TP',
  'Phường Trường Thạnh': 'TD-TT',

  // Khu vực cũ Quận Thủ Đức
  'Phường Bình Chiểu': 'TD-BC',
  'Phường Bình Thọ': 'TD-BT',
  'Phường Hiệp Bình Chánh': 'TD-HBC',
  'Phường Hiệp Bình Phước': 'TD-HBP',
  'Phường Linh Chiểu': 'TD-LC',
  'Phường Linh Đông': 'TD-LD',
  'Phường Linh Tây': 'TD-LT',
  'Phường Linh Trung': 'TD-LTG',
  'Phường Linh Xuân': 'TD-LX',
  'Phường Tam Bình': 'TD-TB',
  'Phường Tam Phú': 'TD-TPH',
  'Phường Trường Thọ': 'TD-TTO',

  // ============================================
  // HUYỆN CỦ CHI - 21 Xã + 1 Thị trấn
  // ============================================
  'Thị trấn Củ Chi': 'HCC-TT',
  'Xã An Nhơn Tây': 'HCC-ANT',
  'Xã An Phú': 'HCC-AP',
  'Xã Bình Mỹ': 'HCC-BM',
  'Xã Hòa Phú': 'HCC-HP',
  'Xã Nhuận Đức': 'HCC-ND',
  'Xã Phạm Văn Cội': 'HCC-PVC',
  'Xã Phú Hòa Đông': 'HCC-PHD',
  'Xã Phú Mỹ Hưng': 'HCC-PMH',
  'Xã Phước Hiệp': 'HCC-PH',
  'Xã Phước Thạnh': 'HCC-PT',
  'Xã Phước Vĩnh An': 'HCC-PVA',
  'Xã Tân An Hội': 'HCC-TAH',
  'Xã Tân Phú Trung': 'HCC-TPT',
  'Xã Tân Thạnh Đông': 'HCC-TTD',
  'Xã Tân Thạnh Tây': 'HCC-TTT',
  'Xã Tân Thông Hội': 'HCC-TTH',
  'Xã Thái Mỹ': 'HCC-TM',
  'Xã Trung An': 'HCC-TA',
  'Xã Trung Lập Hạ': 'HCC-TLH',
  'Xã Trung Lập Thượng': 'HCC-TLT',

  // ============================================
  // HUYỆN HÓC MÔN - 11 Xã + 1 Thị trấn
  // ============================================
  'Thị trấn Hóc Môn': 'HHM-TT',
  'Xã Bà Điểm': 'HHM-BD',
  'Xã Đông Thạnh': 'HHM-DT',
  'Xã Nhị Bình': 'HHM-NB',
  'Xã Tân Hiệp': 'HHM-TH',
  'Xã Tân Thới Nhì': 'HHM-TTN',
  'Xã Tân Xuân': 'HHM-TX',
  'Xã Thới Tam Thôn': 'HHM-TTT',
  'Xã Trung Chánh': 'HHM-TC',
  'Xã Xuân Thới Đông': 'HHM-XTD',
  'Xã Xuân Thới Sơn': 'HHM-XTS',
  'Xã Xuân Thới Thượng': 'HHM-XTT',

  // ============================================
  // HUYỆN BÌNH CHÁNH - 16 Xã
  // ============================================
  'Xã An Phú Tây': 'HBC-APT',
  'Xã Bình Chánh': 'HBC-BC',
  'Xã Bình Hưng': 'HBC-BH',
  'Xã Bình Lợi': 'HBC-BL',
  'Xã Đa Phước': 'HBC-DP',
  'Xã Hưng Long': 'HBC-HL',
  'Xã Lê Minh Xuân': 'HBC-LMX',
  'Xã Phạm Văn Hai': 'HBC-PVH',
  'Xã Phong Phú': 'HBC-PP',
  'Xã Quy Đức': 'HBC-QD',
  'Xã Tân Kiên': 'HBC-TK',
  'Xã Tân Nhựt': 'HBC-TN',
  'Xã Tân Quý Tây': 'HBC-TQT',
  'Xã Tân Túc': 'HBC-TT',
  'Xã Vĩnh Lộc A': 'HBC-VLA',
  'Xã Vĩnh Lộc B': 'HBC-VLB',

  // ============================================
  // HUYỆN NHÀ BÈ - 7 Xã
  // ============================================
  'Xã Hiệp Phước': 'HNB-HP',
  'Xã Long Thới': 'HNB-LT',
  'Xã Nhơn Đức': 'HNB-ND',
  'Xã Phú Xuân': 'HNB-PX',
  'Xã Phước Kiển': 'HNB-PK',
  'Xã Phước Lộc': 'HNB-PL',
  'Thị trấn Nhà Bè': 'HNB-TT',

  // ============================================
  // HUYỆN CẦN GIỜ - 7 Xã
  // ============================================
  'Thị trấn Cần Thạnh': 'HCG-CT',
  'Xã An Thới Đông': 'HCG-ATD',
  'Xã Bình Khánh': 'HCG-BK',
  'Xã Long Hòa': 'HCG-LH',
  'Xã Lý Nhơn': 'HCG-LN',
  'Xã Tam Thôn Hiệp': 'HCG-TTH',
  'Xã Thạnh An': 'HCG-TA',
}

/**
 * Generate area code từ address components
 * @param components - Parsed address components
 * @returns Area code chi tiết đến phường/xã
 */
export function generateAreaCode(components: AddressComponents): string {
  // Ưu tiên: Phường/Xã trước
  if (components.ward) {
    const wardCode = WARD_AREA_CODE_MAP[components.ward]
    if (wardCode) return wardCode
    
    // Fallback: kết hợp tên phường với quận
    if (components.district) {
      const districtCode = DISTRICT_AREA_CODE_MAP[components.district]
      if (districtCode) {
        // Tạo mã tạm từ tên phường (lấy số nếu có)
        const wardNumber = components.ward.match(/\d+/)
        if (wardNumber) {
          return `${districtCode}-${wardNumber[0].padStart(2, '0')}`
        }
      }
    }
  }

  // Fallback: Chỉ có quận/huyện
  if (components.district) {
    const districtCode = DISTRICT_AREA_CODE_MAP[components.district]
    if (districtCode) return districtCode
  }

  return 'UNKNOWN'
}

/**
 * Hàm chính: Lấy area code từ tọa độ hoặc địa chỉ
 */
export async function getAreaCodeFromLocation(
  location: GeoPoint,
  fullAddress: string
): Promise<string> {
  try {
    // Option 1: Parse từ địa chỉ text
    const areaCode = parseAreaCodeFromText(fullAddress)
    if (areaCode !== 'UNKNOWN') return areaCode

    // Option 2: Reverse Geocoding
    const geocoded = await reverseGeocode(location)
    if (geocoded) {
      const components = parseAddressComponents(geocoded.address_components)
      return generateAreaCode(components)
    }

    return 'UNKNOWN'
  } catch (error) {
    console.error('Error getting area code:', error)
    return 'UNKNOWN'
  }
}

/**
 * Parse area code từ text address
 */
function parseAreaCodeFromText(address: string): string {
  const normalizedAddress = address.toLowerCase()
  
  // Tìm phường/xã trước
  for (const [key, code] of Object.entries(WARD_AREA_CODE_MAP)) {
    if (normalizedAddress.includes(key.toLowerCase())) {
      return code
    }
  }

  // Fallback: tìm quận/huyện
  for (const [key, code] of Object.entries(DISTRICT_AREA_CODE_MAP)) {
    if (normalizedAddress.includes(key.toLowerCase())) {
      return code
    }
  }

  return 'UNKNOWN'
}

/**
 * Reverse Geocoding
 */
async function reverseGeocode(location: GeoPoint): Promise<any> {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  if (!API_KEY) {
    console.warn('Google Maps API key not found')
    return null
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${API_KEY}&language=vi`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0]
    }

    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Validate area code
 */
export function isValidAreaCode(areaCode: string): boolean {
  const allCodes = [
    ...Object.values(DISTRICT_AREA_CODE_MAP),
    ...Object.values(WARD_AREA_CODE_MAP)
  ]
  return allCodes.includes(areaCode)
}

/**
 * Get full name from area code
 */
export function getNameFromAreaCode(areaCode: string): string | null {
  // Tìm trong phường/xã
  for (const [name, code] of Object.entries(WARD_AREA_CODE_MAP)) {
    if (code === areaCode) return name
  }

  // Tìm trong quận/huyện
  for (const [name, code] of Object.entries(DISTRICT_AREA_CODE_MAP)) {
    if (code === areaCode) return name
  }

  return null
}

/**
 * Get all districts in TP.HCM
 */
export function getAllDistricts(): Array<{ code: string; name: string }> {
  const districts = new Map<string, string>()
  
  for (const [name, code] of Object.entries(DISTRICT_AREA_CODE_MAP)) {
    if (!districts.has(code)) {
      districts.set(code, name)
    }
  }

  return Array.from(districts.entries()).map(([code, name]) => ({
    code,
    name
  }))
}

/**
 * Get wards by district code
 */
export function getWardsByDistrict(districtCode: string): Array<{ code: string; name: string }> {
  return Object.entries(WARD_AREA_CODE_MAP)
    .filter(([_, code]) => code.startsWith(districtCode + '-'))
    .map(([name, code]) => ({ code, name }))
}